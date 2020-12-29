// ANCHOR -- Require Modules --
const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

// ANCHOR -- Initialize Review Route --
// set 'mergeParams: true' to activate re-routing nested routees
const router = express.Router({ mergeParams: true });

// SECTION == Routes ==

// ANCHOR -- Get All Reviews --
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

// ANCHOR -- Get Review By ID --
router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview);
// router
//   .route('/:id')
//   .get(reviewController.getReview)
//   .patch(reviewController.updateReview)
//   .delete(reviewController.deleteReview);

// !SECTION

// ANCHOR -- Export Router --
module.exports = router;
