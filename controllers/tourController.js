// 1)  REQUIRE MODULES
const Tour = require('../Models/tourModel');
const APIFeatures = require('../Utilities/apiFeatures');

// CONTROLLERS

// == middleware ==
// manupulates the get request to create a sort of default query
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5'; // everything here is a string
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// === CONTROLLER FUNCTIONS ===

// == Get All Tours ==
exports.getAllTours = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

// == Get Tour By ID ==
exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id); // Tour.findOne({ _id: req.params.id})

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

// == Create Tour ==
// add async to this function since Tour.create returns a promise
exports.createTour = async (req, res) => {
  // must use try/catch since async/await could return a failed response
  try {
    // const newTour = new Tour({})
    // newTour.save()

    // create a new document directly to the Tour model and save it to the const newTour
    // must use await here since Tour.create returns a promise
    const newTour = await Tour.create(req.body);

    // response handling
    res.status(201).json({
      //  JSent format response
      status: 'success',
      data: {
        tour: newTour,
      },
    });
    // error handling
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent!',
    });
  }
};

// == Update Tour ==
exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      // sets 'tour' equal to the updated data and not the original data
      new: true,
      // runs all of the validators set in the schema
      runValidators: true,
    });
    // valid ID search handling
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

// == Delete Tour ==
exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    req.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

// == Tour Stats ==
exports.getTourStats = async (req, res) => {
  try {
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

    // send the response
    res.status(200).json({
      satus: 'success',
      data: {
        stats,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
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

    // send the response
    res.status(200).json({
      satus: 'success',
      data: {
        plan,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
