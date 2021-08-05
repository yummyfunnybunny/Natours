// ANCHOR -- Require Modules --
const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../Models/tourModel');
const catchAsync = require('../Utilities/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../Utilities/appError');

// ANCHOR -- Setup Multer --
const multerStorage = multer.memoryStorage();

// 2) Create the Multer Filter
const multerFilter = (req, file, callback) => {
  if (file.mimetype.startsWith('image')) {
    callback(null, true);
  } else {
    callback(
      new AppError('Not an image! Please upload an image file only.', 400),
      false
    );
  }
};

// 3) Initialize multer using the 'multerStorage' object and the 'multerFilter' function that we intitialized above
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// SECTION == Middleware ==

// ANCHOR -- Upload Tour Images --
exports.uploadTourImages = upload.fields([
  {
    name: 'imageCover',
    maxCount: 1,
  },
  {
    name: 'images',
    maxCount: 3,
  },
]);
// use the below syntax if you are uploading multiple files but to only one fiels
// in the above example, if we only had the field named 'images', than we could set it up like this:
// upload.array('images', 3);

// ANCHOR -- Resize Tour Images --
exports.resizeTourImages = catchAsync(async (req, res, next) => {
  // skip to next middleware if there is no imageCover or images
  if (!req.files.imageCover || !req.files.images) return next();

  // 1) Process Cover Image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // 2) Process regular Images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );
  next();
});

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
