// ANCHOR -- Require Modiles --
const Review = require('../Models/reviewModel');
const factory = require('./handlerFactory');
// const APIFeatures = require('../Utilities/apiFeatures');
// const catchAsync = require('../Utilities/catchAsync');
// const AppError = require('../Utilities/appError');

// SECTION == Middleware ==

// ANCHOR -- Set Tour User IDs --
exports.setTourUserIds = (req, res, next) => {
  // allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

// !SECTION

// SECTION == Functions ==

// ANCHOR -- Get All Reviews --
exports.getAllReviews = factory.getAll(Review);

// ANCHOR -- Get Review By ID --
exports.getReview = factory.getOne(Review);

// ANCHOR -- Create Review --
exports.createReview = factory.createOne(Review);

// ANCHOR -- Update Review --
exports.updateReview = factory.updateOne(Review);

// ANCHOR -- Delete Review --
exports.deleteReview = factory.deleteOne(Review);

// !SECTION
