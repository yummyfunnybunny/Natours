// ANCHOR -- Require Modules --
const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

// ANCHOR -- Initialize Review Route --
const router = express.Router();

// SECTION == Routes ==

// ANCHOR -- Protect MiddleWare --
router.use(authController.protect);

// ANCHOR -- Checkout Session --
router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);

// ANCHOR -- Restrict MiddleWare --
router.use(authController.restrictTo('admin', 'lead-guide'));

// ANCHOR -- All Bookings --
router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

// ANCHOR -- Single Booking --
router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

// !SECTION

// ANCHOR -- Export Router --
module.exports = router;
