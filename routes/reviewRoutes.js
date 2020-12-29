// ANCHOR -- Require Modules --
const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

// ANCHOR -- Initialize Review Route --
// set 'mergeParams: true' to activate re-routing nested routees
const router = express.Router({ mergeParams: true });

// SECTION == Routes ==

// ANCHOR -- Protect Routes --
router.use(authController.protect);

// ANCHOR -- Get All Reviews --
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

// ANCHOR -- Get Review By ID --
router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );

// !SECTION

// ANCHOR -- Export Router --
module.exports = router;
