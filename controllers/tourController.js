// 1)  REQUIRE MODULES
const Tour = require('../Models/tourModel');

// CONTROLLERS

// FUNCTIONS
exports.getAllTours = async (req, res) => {
  try {
    // == BUILD THE QUERY ==

    // Traditional MongoDB shell method of querying:
    /*
    const tours = await Tour.find({
      duration: 5,
      difficulty: 'easy',
    });
    */

    // Mongoose Query Method:
    /*
    const tours = await Tour.find()
      .where('duration')
      .equals(5)
      .where('difficulty')
      .equals('easy');
    */
    // = 1A filtering =
    console.log(req.query);
    // create a hard copy of the query by using destructuring within a newly created object
    // so we dont altar the original query object
    const preQuery = { ...req.query };

    // create the list of query fields we want to exclude from our preQuery
    const excludedFields = ['page', 'sort', 'limit', 'fields'];

    // loop through the preQuery and delete all exluded fields that appear
    excludedFields.forEach((el) => delete preQuery[el]);

    // = 1B advanced filtering =
    let queryString = JSON.stringify(preQuery);
    queryString = queryString.replace(
      // regular expression
      // will replace a 'gte' with a '$gte'
      /\b(gte|gt|lte|lt)\b/g, // list the expressions to look for. add 'g' to replace all
      (match) => `$${match}` // use this callback function syntax: template literals
    );

    // perform the query and save it to a new constant "finalQuery"
    let finalQuery = Tour.find(JSON.parse(queryString));

    // = 2 Sorting =
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      finalQuery = finalQuery.sort(sortBy);
    } else {
      // add a default sorting method to the query
      finalQuery = finalQuery.sort('-createdAt');
    }

    // = 3 Limiting Query Results =
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      finalQuery = finalQuery.select('name duration price');
    } else {
      // add a default query limiter
      finalQuery = finalQuery.select('-__v');
    }

    // = 4 Pagination =
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;

    finalQuery = finalQuery.skip(skip).limit(limit);

    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error(`this page does not exist`);
    }

    // == EXECUTE THE QUERY ==
    // await the finalquery to the new constant 'tours'
    const tours = await finalQuery;

    // == SEND RESPONSE ==
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
