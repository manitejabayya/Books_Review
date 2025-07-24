const advancedResults = (model, populate) => async (req, res, next) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude from filtering
    const removeFields = ['select', 'sort', 'page', 'limit', 'search'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, $lt, $lte, $in, $regex)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in|regex|ne|exists)\b/g, match => `$${match}`);

    // Parse back to object
    const queryObj = JSON.parse(queryStr);

    // Handle search functionality
    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options: 'i' };
      
      // Different search strategies based on model
      if (model.modelName === 'Book') {
        queryObj.$or = [
          { title: searchRegex },
          { author: searchRegex },
          { description: searchRegex },
          { genre: searchRegex },
          { tags: searchRegex }
        ];
      } else if (model.modelName === 'User') {
        queryObj.$or = [
          { username: searchRegex },
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex }
        ];
      } else if (model.modelName === 'Review') {
        queryObj.$or = [
          { reviewText: searchRegex },
          { title: searchRegex }
        ];
      }
    }

    // Handle genre filtering for books
    if (req.query.genre && req.query.genre !== 'all') {
      queryObj.genre = req.query.genre;
    }

    // Handle author filtering for books
    if (req.query.author) {
      queryObj.author = { $regex: req.query.author, $options: 'i' };
    }

    // Handle rating filtering
    if (req.query.minRating || req.query.maxRating) {
      queryObj.averageRating = {};
      if (req.query.minRating) {
        queryObj.averageRating.$gte = parseFloat(req.query.minRating);
      }
      if (req.query.maxRating) {
        queryObj.averageRating.$lte = parseFloat(req.query.maxRating);
      }
    }

    // Handle date range filtering
    if (req.query.dateFrom || req.query.dateTo) {
      queryObj.createdAt = {};
      if (req.query.dateFrom) {
        queryObj.dateFrom.$gte = new Date(req.query.dateFrom);
      }
      if (req.query.dateTo) {
        queryObj.createdAt.$lte = new Date(req.query.dateTo);
      }
    }

    // Handle published year filtering for books
    if (req.query.publishedFrom || req.query.publishedTo) {
      queryObj.publishedYear = {};
      if (req.query.publishedFrom) {
        queryObj.publishedYear.$gte = parseInt(req.query.publishedFrom);
      }
      if (req.query.publishedTo) {
        queryObj.publishedYear.$lte = parseInt(req.query.publishedTo);
      }
    }

    // Handle boolean filters
    if (req.query.isActive !== undefined) {
      queryObj.isActive = req.query.isActive === 'true';
    }

    if (req.query.isFeatured !== undefined) {
      queryObj.isFeatured = req.query.isFeatured === 'true';
    }

    if (req.query.isRecommended !== undefined) {
      queryObj.isRecommended = req.query.isRecommended === 'true';
    }

    // Finding resource
    query = model.find(queryObj);

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      // Default sorting
      if (model.modelName === 'Book') {
        query = query.sort('-averageRating -totalRatings -createdAt');
      } else if (model.modelName === 'Review') {
        query = query.sort('-helpfulVotes -createdAt');
      } else {
        query = query.sort('-createdAt');
      }
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments(queryObj);

    query = query.skip(startIndex).limit(limit);

    // Populate
    if (populate) {
      if (Array.isArray(populate)) {
        populate.forEach(pop => {
          query = query.populate(pop);
        });
      } else {
        query = query.populate(populate);
      }
    }

    // Executing query
    const results = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    // Calculate total pages
    pagination.totalPages = Math.ceil(total / limit);
    pagination.currentPage = page;
    pagination.total = total;
    pagination.limit = limit;

    // Attach to response
    res.advancedResults = {
      success: true,
      count: results.length,
      pagination,
      data: results,
      filters: {
        applied: reqQuery,
        search: req.query.search || null,
        sort: req.query.sort || 'default'
      }
    };

    next();
  } catch (error) {
    next(error);
  }
};

// Helper function to build aggregation pipeline for advanced filtering
const buildAggregationPipeline = (req, matchStage = {}) => {
  const pipeline = [];

  // Match stage
  const match = { ...matchStage };

  // Handle search
  if (req.query.search) {
    match.$text = { $search: req.query.search };
  }

  // Handle genre filtering
  if (req.query.genre && req.query.genre !== 'all') {
    match.genre = req.query.genre;
  }

  // Handle rating filtering
  if (req.query.minRating || req.query.maxRating) {
    match.averageRating = {};
    if (req.query.minRating) {
      match.averageRating.$gte = parseFloat(req.query.minRating);
    }
    if (req.query.maxRating) {
      match.averageRating.$lte = parseFloat(req.query.maxRating);
    }
  }

  pipeline.push({ $match: match });

  // Add lookup stages for population
  if (req.query.populate) {
    const populateFields = req.query.populate.split(',');
    populateFields.forEach(field => {
      if (field === 'addedBy') {
        pipeline.push({
          $lookup: {
            from: 'users',
            localField: 'addedBy',
            foreignField: '_id',
            as: 'addedBy'
          }
        });
        pipeline.push({
          $unwind: {
            path: '$addedBy',
            preserveNullAndEmptyArrays: true
          }
        });
      }
    });
  }

  // Sort stage
  let sortStage = {};
  if (req.query.sort) {
    const sortFields = req.query.sort.split(',');
    sortFields.forEach(field => {
      if (field.startsWith('-')) {
        sortStage[field.substring(1)] = -1;
      } else {
        sortStage[field] = 1;
      }
    });
  } else {
    sortStage = { createdAt: -1 };
  }
  pipeline.push({ $sort: sortStage });

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const skip = (page - 1) * limit;

  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: limit });

  return pipeline;
};

// Helper function for faceted search (with counts)
const facetedSearch = (model, facetFields = []) => async (req, res, next) => {
  try {
    const pipeline = [];
    const match = {};

    // Build match stage
    if (req.query.search) {
      match.$text = { $search: req.query.search };
    }

    if (req.query.genre && req.query.genre !== 'all') {
      match.genre = req.query.genre;
    }

    pipeline.push({ $match: match });

    // Build facet stage
    const facet = {
      data: [
        { $skip: ((parseInt(req.query.page, 10) || 1) - 1) * (parseInt(req.query.limit, 10) || 25) },
        { $limit: parseInt(req.query.limit, 10) || 25 }
      ],
      total: [{ $count: 'count' }]
    };

    // Add facet counts for specified fields
    facetFields.forEach(field => {
      facet[`${field}Counts`] = [
        { $group: { _id: `$${field}`, count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ];
    });

    pipeline.push({ $facet: facet });

    const results = await model.aggregate(pipeline);
    const data = results[0];

    res.facetedResults = {
      success: true,
      count: data.data.length,
      total: data.total[0]?.count || 0,
      data: data.data,
      facets: {}
    };

    // Add facet counts to response
    facetFields.forEach(field => {
      res.facetedResults.facets[field] = data[`${field}Counts`];
    });

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  advancedResults,
  buildAggregationPipeline,
  facetedSearch
};