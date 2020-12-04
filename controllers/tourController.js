// 1)  REQUIRE MODULES
const Tour = require('../Models/tourModel');

// CONTROLLERS

// FUNCTIONS
exports.getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find();

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
