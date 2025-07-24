const NodeGeocoder = require('node-geocoder');
const { ErrorResponses } = require('./errorResponse');

/**
 * Geocoding Service
 * Provides location-based functionality for the book review platform
 */

// Configuration for different geocoding providers
const PROVIDERS = {
  GOOGLE: 'google',
  MAPQUEST: 'mapquest',
  OPENCAGE: 'opencage',
  LOCATIONIQ: 'locationiq',
  HERE: 'here'
};

// Default geocoder configuration
const DEFAULT_CONFIG = {
  provider: process.env.GEOCODER_PROVIDER || PROVIDERS.OPENCAGE,
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null,
  httpAdapter: 'https',
  timeout: 10000,
  language: 'en',
  region: process.env.GEOCODER_REGION || 'US'
};

// Provider-specific configurations
const PROVIDER_CONFIGS = {
  [PROVIDERS.GOOGLE]: {
    ...DEFAULT_CONFIG,
    provider: PROVIDERS.GOOGLE,
    apiKey: process.env.GOOGLE_GEOCODER_API_KEY
  },
  [PROVIDERS.MAPQUEST]: {
    ...DEFAULT_CONFIG,
    provider: PROVIDERS.MAPQUEST,
    apiKey: process.env.MAPQUEST_API_KEY
  },
  [PROVIDERS.OPENCAGE]: {
    ...DEFAULT_CONFIG,
    provider: PROVIDERS.OPENCAGE,
    apiKey: process.env.OPENCAGE_API_KEY
  },
  [PROVIDERS.LOCATIONIQ]: {
    ...DEFAULT_CONFIG,
    provider: PROVIDERS.LOCATIONIQ,
    apiKey: process.env.LOCATIONIQ_API_KEY
  },
  [PROVIDERS.HERE]: {
    ...DEFAULT_CONFIG,
    provider: PROVIDERS.HERE,
    apiKey: process.env.HERE_API_KEY
  }
};

class GeoCoder {
  constructor(provider = null) {
    this.provider = provider || DEFAULT_CONFIG.provider;
    this.config = PROVIDER_CONFIGS[this.provider] || DEFAULT_CONFIG;
    
    if (!this.config.apiKey) {
      console.warn(`⚠ No API key found for geocoding provider: ${this.provider}`);
    }
    
    this.geocoder = NodeGeocoder(this.config);
  }

  /**
   * Geocode an address to get coordinates
   * @param {string} address - Address to geocode
   * @returns {Promise<Object>} - Location data with coordinates
   */
  async geocodeAddress(address) {
    try {
      if (!address || typeof address !== 'string') {
        throw ErrorResponses.badRequest('Valid address is required');
      }

      const results = await this.geocoder.geocode(address);
      
      if (!results || results.length === 0) {
        throw ErrorResponses.notFound('Location not found for the provided address');
      }

      const location = results[0];
      
      return {
        address: location.formattedAddress,
        coordinates: {
          latitude: location.latitude,
          longitude: location.longitude
        },
        city: location.city,
        state: location.stateCode,
        country: location.countryCode,
        zipcode: location.zipcode,
        provider: this.provider
      };

    } catch (error) {
      if (error instanceof ErrorResponse) {
        throw error;
      }

      console.error('Geocoding error:', error);
      throw ErrorResponses.externalServiceError('Geocoding service', error.message);
    }
  }

  /**
   * Reverse geocode coordinates to get address
   * @param {number} latitude - Latitude coordinate
   * @param {number} longitude - Longitude coordinate
   * @returns {Promise<Object>} - Address data
   */
  async reverseGeocode(latitude, longitude) {
    try {
      if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
        throw ErrorResponses.badRequest('Valid latitude and longitude are required');
      }

      if (latitude < -90 || latitude > 90) {
        throw ErrorResponses.badRequest('Latitude must be between -90 and 90');
      }

      if (longitude < -180 || longitude > 180) {
        throw ErrorResponses.badRequest('Longitude must be between -180 and 180');
      }

      const results = await this.geocoder.reverse({ lat: latitude, lon: longitude });
      
      if (!results || results.length === 0) {
        throw ErrorResponses.notFound('Address not found for the provided coordinates');
      }

      const location = results[0];
      
      return {
        address: location.formattedAddress,
        coordinates: {
          latitude: location.latitude,
          longitude: location.longitude
        },
        city: location.city,
        state: location.stateCode,
        country: location.countryCode,
        zipcode: location.zipcode,
        provider: this.provider
      };

    } catch (error) {
      if (error instanceof ErrorResponse) {
        throw error;
      }

      console.error('Reverse geocoding error:', error);
      throw ErrorResponses.externalServiceError('Reverse geocoding service', error.message);
    }
  }

  /**
   * Calculate distance between two coordinates
   * @param {Object} point1 - First coordinate {latitude, longitude}
   * @param {Object} point2 - Second coordinate {latitude, longitude}
   * @param {string} unit - Distance unit (km, mi, m)
   * @returns {number} - Distance between points
   */
  calculateDistance(point1, point2, unit = 'km') {
    const { latitude: lat1, longitude: lon1 } = point1;
    const { latitude: lat2, longitude: lon2 } = point2;

    if (!this.isValidCoordinate(lat1, lon1) || !this.isValidCoordinate(lat2, lon2)) {
      throw ErrorResponses.badRequest('Invalid coordinates provided');
    }

    const R = unit === 'mi' ? 3959 : unit === 'm' ? 6371000 : 6371; // Radius in km, miles, or meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Find locations within a certain radius
   * @param {Object} center - Center point {latitude, longitude}
   * @param {Array} locations - Array of location objects with coordinates
   * @param {number} radius - Search radius in km
   * @returns {Array} - Filtered locations within radius
   */
  findWithinRadius(center, locations, radius) {
    if (!this.isValidCoordinate(center.latitude, center.longitude)) {
      throw ErrorResponses.badRequest('Invalid center coordinates');
    }

    if (!Array.isArray(locations)) {
      throw ErrorResponses.badRequest('Locations must be an array');
    }

    return locations
      .map(location => {
        if (!location.coordinates || 
            !this.isValidCoordinate(location.coordinates.latitude, location.coordinates.longitude)) {
          return null;
        }

        const distance = this.calculateDistance(center, location.coordinates);
        
        return {
          ...location,
          distance
        };
      })
      .filter(location => location && location.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
  }

  /**
   * Get location suggestions/autocomplete
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} - Array of location suggestions
   */
  async getLocationSuggestions(query, options = {}) {
    try {
      if (!query || query.length < 3) {
        throw ErrorResponses.badRequest('Query must be at least 3 characters long');
      }

      const { limit = 5, country = null, bounds = null } = options;

      // This is a basic implementation - you might want to use a dedicated autocomplete service
      const results = await this.geocoder.geocode(query);
      
      return results
        .slice(0, limit)
        .map(location => ({
          id: `${location.latitude}_${location.longitude}`,
          address: location.formattedAddress,
          city: location.city,
          state: location.stateCode,
          country: location.countryCode,
          coordinates: {
            latitude: location.latitude,
            longitude: location.longitude
          }
        }));

    } catch (error) {
      if (error instanceof ErrorResponse) {
        throw error;
      }

      console.error('Location suggestions error:', error);
      throw ErrorResponses.externalServiceError('Location suggestions service', error.message);
    }
  }

  /**
   * Validate coordinates
   * @param {number} latitude - Latitude to validate
   * @param {number} longitude - Longitude to validate
   * @returns {boolean} - Whether coordinates are valid
   */
  isValidCoordinate(latitude, longitude) {
    return !isNaN(latitude) && !isNaN(longitude) &&
           latitude >= -90 && latitude <= 90 &&
           longitude >= -180 && longitude <= 180;
  }

  /**
   * Convert degrees to radians
   * @param {number} degrees - Degrees to convert
   * @returns {number} - Radians
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get timezone for coordinates
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @returns {Promise<string>} - Timezone string
   */
  async getTimezone(latitude, longitude) {
    try {
      if (!this.isValidCoordinate(latitude, longitude)) {
        throw ErrorResponses.badRequest('Invalid coordinates provided');
      }

      // This would require a separate timezone API service
      // For now, return a placeholder
      return 'UTC';

    } catch (error) {
      console.error('Timezone lookup error:', error);
      throw ErrorResponses.externalServiceError('Timezone service', error.message);
    }
  }

  /**
   * Batch geocode multiple addresses
   * @param {Array} addresses - Array of addresses to geocode
   * @param {Object} options - Batch options
   * @returns {Promise<Array>} - Array of geocoded results
   */
  async batchGeocode(addresses, options = {}) {
    try {
      if (!Array.isArray(addresses)) {
        throw ErrorResponses.badRequest('Addresses must be an array');
      }

      const { maxConcurrent = 5, delay = 100 } = options;
      const results = [];
      
      // Process addresses in batches to avoid rate limiting
      for (let i = 0; i < addresses.length; i += maxConcurrent) {
        const batch = addresses.slice(i, i + maxConcurrent);
        
        const batchPromises = batch.map(async (address, index) => {
          try {
            // Add delay to avoid rate limiting
            if (delay > 0) {
              await new Promise(resolve => setTimeout(resolve, delay * index));
            }
            
            return await this.geocodeAddress(address);
          } catch (error) {
            return {
              address,
              error: error.message,
              success: false
            };
          }
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      }

      return results;

    } catch (error) {
      console.error('Batch geocoding error:', error);
      throw ErrorResponses.externalServiceError('Batch geocoding service', error.message);
    }
  }
}

/**
 * Default geocoder instance
 */
const defaultGeocoder = new GeoCoder();

/**
 * Utility functions for location-based features
 */
const LocationUtils = {
  /**
   * Find nearby bookstores or libraries
   * @param {Object} coordinates - User coordinates
   * @param {string} type - Type of place to search for
   * @returns {Promise<Array>} - Array of nearby places
   */
  async findNearbyBookPlaces(coordinates, type = 'bookstore') {
    // This would integrate with places API (Google Places, Foursquare, etc.)
    // For now, return placeholder data
    return [];
  },

  /**
   * Get location-based book recommendations
   * @param {string} location - User location
   * @returns {Promise<Array>} - Location-based recommendations
   */
  async getLocationBasedRecommendations(location) {
    // This could recommend books based on local authors, regional literature, etc.
    return [];
  },

  /**
   * Format location for display
   * @param {Object} location - Location object
   * @returns {string} - Formatted location string
   */
  formatLocation(location) {
    const { city, state, country } = location;
    
    if (city && state && country) {
      return `${city}, ${state}, ${country}`;
    } else if (city && country) {
      return `${city}, ${country}`;
    } else if (country) {
      return country;
    }
    
    return 'Unknown location';
  },

  /**
   * Parse location string into components
   * @param {string} locationString - Location string to parse
   * @returns {Object} - Parsed location components
   */
  parseLocation(locationString) {
    if (!locationString) return {};
    
    const parts = locationString.split(',').map(part => part.trim());
    
    if (parts.length >= 3) {
      return {
        city: parts[0],
        state: parts[1],
        country: parts[2]
      };
    } else if (parts.length === 2) {
      return {
        city: parts[0],
        country: parts[1]
      };
    } else {
      return {
        country: parts[0]
      };
    }
  }
};

module.exports = {
  GeoCoder,
  LocationUtils,
  PROVIDERS,
  defaultGeocoder
};