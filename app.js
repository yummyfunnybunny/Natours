// =====================================
// 1)  REQUIRE MODULES
// =====================================
const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

// common practice to create a variable called "app" that is set to the newly requirec express
const app = express();  


// =====================================
// 2) MIDDLEWARE
// =====================================
// MIDDLEWARE - function that can modifer the incoming request data (stands between the request and the response)
// "app.use([function])"

// 3rd party middleware
app.use(morgan('dev'));
app.use(express.json());

// here is the standard format for your own middleware:
// without specifying a specific route, this will be applied to every single route that you have
// the order of routes/middleware in your code MATTERS, middleware must come before the route handlers
// can have as many middleware functions as you like
app.use((req, res, next) => {
  console.log('Hello from the middleware!');
  // must call the 'next' function at the end of your middleware
  next();
});

// in this middleware example, we need to know exactly what time the request happened
// we create a 'requestTime' variable inside the request and set it to the current time
app.use((req, res, next) => {
  // '.toISOString' will convert the date to a string
  req.requestTime = new Date().toISOString();
  // don't forget to call the 'next' function!
  next();
  // check the 'getAllTours' function below to see how we utilize this 'requestTime' variable inside of the GET REQUEST
});

// save the data we want into a variable in a synchronous way (since it does not matter in top-level code)
// we will parse this data into a JSON file right away
const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

// =====================================
// 3) ROUTE HANDLERS
// =====================================
const getAllTours = (req,res) => {
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
      tours: tours
      // if we saved the JSON data above into a variable called "x" instead of "tours", we would have to write out:
      // "tours: x", because enveloping name we want is different from the variable with the saved data that we want
    }
  })
};

const getTour = (req,res) => {
  // variables in the URL are called 'parameters', and they are stored inside 'req.params'
  console.log(req.params);  // { id: '5' } - this is an object

  // when you multiply a string-number by a real number, it will turn into a real number
  const id = req.params.id * 1; 
  
  // iterate through the 'tours' array and return the value of the first tour whose id matches the searched-for id
  const tour = tours.find(el => el.id === id);
  
  // check if the id being searched for is valid
  // if (id > tours.length) {
  // OR
  // check if the 'tour' variable that came back is 'undefined' from the 'find' method above
  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'invalid ID'
    });
  }

  // send the response with the correct tour data back to the client
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tour
    }
  })
}

const createTour = (req, res) => {
  // we do 'req.body' because body is the property that is going to be available on the request...
  // console.log(req.body);

  // create an ID for the new tours entry:
  const newId = tours[tours.length-1].id + 1;

  // create a new object using the "Object.assign" method, which takes two existing objects (newId & req.body), and
  // merges them together into one object
  const newTour = Object.assign({id: newId}, req.body);

  // Push the new tour object into the tours array
  tours.push(newTour);

  // write the 'tours-simple' database to the server
  // when sending data to a web server, the data has to be a string, so we use 'JSON.stringify' to turn the 'tours'
  // array into a string before finalizing the post request
  fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), (err) => {
    // status 201 = "created" - we just 'created' a new tour, so this is appropriate
    res.status(201).json({
      //  once again, we use the JSent format
      status: 'success',
      data: {
        tour: newTour
      }
    });
  });

  // must have a response of some kind to complete the request/response cycle
  // res.send("Done");
};

const updateTour = (req, res) => {
  // invalid ID search handling
  if ((req.params.id * 1) > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'invalid ID'
    });
  }

  // testing the patch
  // const id = req.params.id * 1; 
  // const tour = tours.find(el => el.id === id);
  // tour.duration = req.body.duration;

  // valid ID search handling
  res.status(200).json({
    status: 'success',
    data: {
      // tour: "<Updated tour here...>"
      tour
    }
  })
};

const deleteTour = (req, res) => {
  if ((req.params.id * 1) > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'invalid ID'
    });
  }

  // valid ID search handling
  // '204' = 'success: no content', which is what we want for a delete request 
  res.status(204).json({
    status: 'success',
    data: null
  });
};

// =====================================
// 4) ROUTES
// =====================================
// each route individually (OLD WAY)
// ----------------------------------------
// app.get('/api/v1/tours', getAllTours);
// notice the ':id' at the end of the url, that syntax will check for a variable, in this case, the var "id"
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);
// ---------------------------------------------
// routes chained together (NEW WAY)
// ----------------------------------------
app
  .route('/api/v1/tours')
  .get(getAllTours)
  .post(createTour);

app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

// =====================================
// 5) START SERVER
// =====================================
// create a variable for the port
const port = 3000;

// set the listen handler using the 'port' variable
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// NOTE: routing means "how a server responds to a certain client request"




