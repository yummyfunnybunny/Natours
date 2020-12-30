// 1)  REQUIRE MODULES
// a: core modules
const express = require('express');

// b: developer modules
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

router // this route is now named after the sub-route name we created in step 1 and used in step 2
  .route('/') // the route here is simply '/', because this now points to the root of our sub-route
  .get(tourController.getAllTours)
  .post(tourController.checkBody, tourController.createTour); // here we called two functions in one post. COOL!

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

// NOTE: since the functions are now coming from the 'toursController' object that we required at the top,
// all of these functions simply need the 'tourController.' infromt of the function name

// EXPORT
// -----------------------------------------
module.exports = router;
