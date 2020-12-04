/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable node/no-unsupported-features/es-syntax */
// OLD CODE
/* 
this code is based on the test-file we used to manage documents BEFORE we began using mongoDB applications
this is for notes ONLY
*/

// 1)  REQUIRE MODULES
// a: core modules
const fs = require('fs');
// b: developer modules
// c: 3rd party modules

//save the json file 'tours-simple' into a JSON-parsed variable (no longer need)
const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

// CONTROLLERS (route handlers)
// ------------------------------------
// EXPORTING ALL FUNCTIONS:
// since we are exporting all of the functions, we need to add 'exports.' infront of all of our functions to export each one separately

//  MIDDLEWARE
// thismiddleware takes a 4th param: val. we use this when passing an element from the calling function
exports.checkID = (req, res, next, val) => {
  console.log(`Tour id is: ${val}`); // 'val' holds the value of the id being passed into the function
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'invalid ID',
    });
  }
  next();
};

// this middleware does not need a val because no element is being passed through this function from the calling function
exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price',
    });
  }
  next();
};

// FUNCTIONS
exports.getAllTours = (req, res) => {
  console.log(req.requestTime); // comes from the 'middleware'
  // useful to list the 'status' even if its not needed
  // we will be using the 'JSend' response format with 'enveloping':
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime, // comes from the middleware
    // the "results" response is handy when a response contains arrays or multiple objects, but is not
    // part of the RESTFUL API common practices, just useful for us :)
    results: tours.length,
    data: {
      // in ES6, we do not need to specify the key and value if they have the same name. you can simply just write:
      // "tours" below, instead of "tours: tours".
      tours: tours,
      // if we saved the JSON data above into a variable called "x" instead of "tours", we would have to write out:
      // "tours: x", because enveloping name we want is different from the variable with the saved data that we want
    },
  });
};

exports.getTour = (req, res) => {
  // variables in the URL are called 'parameters', and they are stored inside 'req.params'
  console.log(req.params); // { id: '5' } - this is an object

  // when you multiply a string-number by a real number, it will turn into a real number
  const id = req.params.id * 1;

  // iterate through the 'tours' array and return the value of the first tour whose id matches the searched-for id
  const tour = tours.find((el) => el.id === id);

  // send the response with the correct tour data back to the client
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tour,
    },
  });
};

exports.createTour = (req, res) => {
  // we do 'req.body' because body is the property that is going to be available on the request...
  // console.log(req.body);

  // create an ID for the new tours entry:
  const newId = tours[tours.length - 1].id + 1;

  // create a new object using the "Object.assign" method, which takes two existing objects (newId & req.body), and
  // create a new object using the spread operater on the req.body
  // merges them together into one object
  // const newTour = Object.assign({ id: newId }, req.body);
  const newTour = { id: newId, ...req.body };

  // Push the new tour object into the tours array

  // write the 'tours-simple' database to the server
  // when sending data to a web server, the data has to be a string, so we use 'JSON.stringify' to turn the 'tours'
  // array into a string before finalizing the post request
  fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), (err) => {
    // status 201 = "created" - we just 'created' a new tour, so this is appropriate
    res.status(201).json({
      //  once again, we use the JSent format
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  });

  // must have a response of some kind to complete the request/response cycle
  // res.send("Done");
};

exports.updateTour = (req, res) => {
  // valid ID search handling
  res.status(200).json({
    status: 'success',
    data: {
      // tour: "<Updated tour here...>"
      tour,
    },
  });
};

exports.deleteTour = (req, res) => {
  // valid ID search handling
  // '204' = 'success: no content', which is what we want for a delete request
  res.status(204).json({
    status: 'success',
    data: null,
  });
};
