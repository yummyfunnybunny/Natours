// ANCHOR -- Require Modules --
const Tour = require('../Models/tourModel');
const APIFeatures = require('../Utilities/apiFeatures');
const catchAsync = require('../Utilities/catchAsync');
const AppError = require('../Utilities/appError');

// SECTION == Middleware ==

// ANCHOR -- Alias Top Tours --
// manupulates the get request to create a sort of default query
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5'; // everything here is a string
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// SECTION == Functions ==

// ANCHOR -- Get All Tours --
exports.getAllTours = catchAsync(async (req, res, next) => {
  // Execute The Query with whatever features you want
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // await the finalquery to the new constant 'tours'
  const tours = await features.query;

  // Send Response
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

// ANCHOR -- Get Tour By ID --
exports.getTour = catchAsync(async (req, res, next) => {
  // save the requested tour
  const tour = await Tour.findById(req.params.id); // Tour.findOne({ _id: req.params.id})

  // if the id was invalid, return an error
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  // send success response
  res.status(200).json({
    // JSent format response
    status: 'success',
    data: {
      tour,
    },
  });
});

// ANCHOR -- Create Tour --
exports.createTour = catchAsync(async (req, res, next) => {
  // create a new document directly to the Tour model and save it to the const newTour
  // must use await here since Tour.create returns a promise
  const newTour = await Tour.create(req.body);

  // send the response
  res.status(201).json({
    // JSent format response
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

// ANCHOR -- Update Tour --
exports.updateTour = catchAsync(async (req, res, next) => {
  // search for the tour to update based on the ID input
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    // sets 'tour' equal to the updated data and not the original data
    new: true,
    // runs all of the validators set in the schema
    runValidators: true, // this will re-run all validators in the schema when updating a document
  });

  // If searched-for ID comes up empty, return an error
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  // send success response
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

// ANCHOR -- Delete Tour --
exports.deleteTour = catchAsync(async (req, res, next) => {
  // search for the tour to delete
  const tour = await Tour.findByIdAndDelete(req.params.id);

  // if no tour is found, return an error
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  // send success response
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// ANCHOR -- Get Tour Stats --
exports.getTourStats = catchAsync(async (req, res, next) => {
  // aggegate the Tour model
  // define the 'stages' of the aggregation process
  const stats = await Tour.aggregate([
    {
      // stage 1
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      // stage 2: group objects based on the below operations
      $group: {
        _id: { $toUpper: '$difficulty' }, // gives us a group of data for each difficulty
        numTours: { $sum: 1 }, // simply calculates the total number of tours (sum of documents in your collection)
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // example of us reusing the match again in the aggregation pipeline
    // {
    //   $match: { _id: { $ne: 'EASY ' } },
    // },
  ]);

  // send success response
  res.status(200).json({
    satus: 'success',
    data: {
      stats,
    },
  });
});

// ANCHOR -- Get Monthly Plan --
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; // 2021 - we have to multiply by 1 because req.params.year returns a string

  const plan = await Tour.aggregate([
    {
      // stage 1: unwind will separate instances in an array and create its own document (sort of like destructuring)
      // so in our example, we are unwinding our data based on the 'startDates' field. well the 'startDates' field
      // is an array, which contains 3 dates for each tour. we have 9 different tours, so after unwinding this way,
      // we will have 27 documents, separated by startDates.
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' }, // group documents together by month
        numTourStarts: { $sum: 1 }, // sums up the total number of tours starting in that month
        tours: { $push: '$name' }, // creates a new array and uses the 'push' method to add to it
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numToursStarts: -1 }, // 1 = ascending order, -1 = descending order
    },
    {
      $limit: 12, // you can set this lower if you want to remove the non-busy months
    },
  ]);

  // send success response
  res.status(200).json({
    satus: 'success',
    data: {
      plan,
    },
  });
});
