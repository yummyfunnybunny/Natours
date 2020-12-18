// == Require Modules/Packages ==
const express = require('express');
const authController = require('../controllers/authController');
const tourController = require('../controllers/tourController'); // import the functions from the 'tourController' file
// you can also use destructuring on the require function above so that all of the functions coming from
// the 'tourController' file are each their own stand-alone function inside of this module
const router = express.Router();

// c: 3rd party modules

// ROUTES
// -------------------------------------

// PARAM MIDDLEWARE
// param middleware is middleware that only runs for certain parameters, in this case: 'id'
// this will only be run for the 'tour' urls
// if no ID is present in the URL search request, than this middleware will not be run
// router.param('[paramName]', (req, res, next, val) => {});
// router.param('id', tourController.checkID);

// == Alias Route ==
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

// == Tour Stats Route ==
router.route('/tour-stats').get(tourController.getTourStats);

// Get Tour Monthly Plan Route ==
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

// == Get All Tours Route ==
router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

// == Get Tour By ID Route ==
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

// EXPORTS
module.exports = router;
