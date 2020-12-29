// ANCHOR -- Require Modules --
const AppError = require('../Utilities/appError');
const catchAsync = require('../Utilities/catchAsync');
const APIFeatures = require('../Utilities/apiFeatures');

// ANCHOR -- Delete One --
// will return a function that deletes one of whatever was requested to delete
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // search for the document to delete
    const document = await Model.findByIdAndDelete(req.params.id);

    // if no document is found, return an error
    if (!document) {
      return next(new AppError('No document found with that ID', 404));
    }

    // send success response
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

// ANCHOR -- Update One --
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // search for the Model to update based on the ID input
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      // sets 'document' equal to the updated data and not the original data
      new: true,
      // runs all of the validators set in the schema
      runValidators: true, // this will re-run all validators in the schema when updating a document
    });

    // If searched-for ID comes up empty, return an error
    if (!document) {
      return next(new AppError('No document found with that ID', 404));
    }

    // send success response
    res.status(200).json({
      status: 'success',
      data: {
        data: document,
      },
    });
  });

// ANCHOR -- Create One --
exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // create a new document directly to the Tour model and save it to the const newDocument
    // must use await here since Tour.create returns a promise
    const newDocument = await Model.create(req.body);

    // send the response
    res.status(201).json({
      // JSent format response
      status: 'success',
      data: {
        data: newDocument,
      },
    });
  });

// ANCHOR -- Get One --
exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const document = await query;

    // if the id was invalid, return an error
    if (!document) {
      return next(new AppError('No document found with that ID', 404));
    }

    // send success response
    res.status(200).json({
      // JSent format response
      status: 'success',
      data: {
        data: document,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // To allow for nexted GET reviews on tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    // Execute The Query with whatever features you want
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // await the finalquery to the new constant 'document'
    const document = await features.query;

    // Send Response
    res.status(200).json({
      status: 'success',
      results: document.length,
      data: {
        data: document,
      },
    });
  });
