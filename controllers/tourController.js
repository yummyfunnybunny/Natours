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
