// ANCHOR -- Require Modules --
const Tour = require('../Models/tourModel');
const catchAsync = require('../Utilities/catchAsync');
const factory = require('./handlerFactory');
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

// !SECTION

// SECTION == Functions ==

// ANCHOR -- Get All Tours --
exports.getAllTours = factory.getAll(Tour);

// ANCHOR -- Get Tour By ID --
exports.getTour = factory.getOne(Tour, { path: 'reviews' });

// ANCHOR -- Create Tour --
exports.createTour = factory.createOne(Tour);

// ANCHOR -- Update Tour --
exports.updateTour = factory.updateOne(Tour);

// ANCHOR -- Delete Tour --
exports.deleteTour = factory.deleteOne(Tour);

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
        TotalToursThisMonth: { $sum: 1 }, // sums up the total number of tours starting in that month
        toursList: { $push: '$name' }, // creates a new array and uses the 'push' method to add to it
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

// ANCHOR -- Get Tours Within --
// url example: // /tours/tours-within/400/center/34.111745,-118.113491/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
  // destructure the url parameters into their own constants
  const { distance, latlng, unit } = req.params;

  // destructure the latlng constant into an array of separated units
  const [lat, lng] = latlng.split(',');

  // define the radius by converting the distance provided into the mongoDB accepted unit 'radian'
  // Earth Radius in miles: 3963.2
  // Earth radius in kilometers: 6378.1
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  // If lat/lng was not provided in correct format, throw an error
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide  latitude and longitude in the format lat,lng.',
        400
      )
    );
  }

  // check the variables if you want to...
  // console.log(distance, lat, lng, unit);

  // filter the tours based on the startLocation being within the desired distance
  // '$geoWithin' is an operator like '$lt/$gte', but for geospatial data
  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        // notice that longitude comes first in geoJSON, NOT latitude
        $centerSphere: [[lng, lat], radius],
      },
    },
  });

  // Send success response
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  // destructure the url parameters into their own constants
  const { latlng, unit } = req.params;

  // destructure the latlng constant into an array of separated units
  const [lat, lng] = latlng.split(',');

  // set the multipler to convert meters (default) to either miles or kilometers
  const multipler = unit === 'mi' ? 0.000621371 : 0.001;

  // If lat/lng was not provided in correct format, throw an error
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide  latitude and longitude in the format lat,lng.',
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    // only one single stage for geospatial aggregation:
    {
      $geoNear: {
        near: {
          type: 'Point',
          // we have to multiply each const by 1 to turn them from a string to a number
          // req.params is a string
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multipler,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  // Send success response
  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});
