// =====================================
// 1)  REQUIRE MODULES
// =====================================
const express = require('express');
const morgan = require('morgan');

// require the routers from the routes folder
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// common practice is to create a variable called "app" that is set to the newly required express
const app = express();  


// =====================================
// 2) MIDDLEWARE
// =====================================
// MIDDLEWARE - function that can modifer the incoming request data (stands between the request and the response)
// "app.use([function])"

// 3rd party middleware
console.log(process.env.NODE_ENV);  // environment variables accessed via 'process.env'
if (process.env.NODE_ENV != 'production') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.static(`${__dirname}/public`)); // this is a built-in express module we can call in order to view
// static files in the browser. in this case, we want to 'serve' files in the 'public' folder to the browser

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



// =====================================
// 3) ROUTE HANDLERS (WE NOW CALL THEM 'CONTROLLERS')
// =====================================
// --> MOVED TO 'tourController.js' and 'userController.js' <--



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
// --> MOVED TO 'tourRoutes.js' and 'userRoutes.js' <--

// 4.1) CREATING MULTIPLE ROUTERS (MOUNTING)
// ----------------------------------------
// here we will create "sub-routes", so that all of our routes are not running through the 'app' variable...
// we do this by creating new middleware that defines these sub-routes for us. this takes 2 steps

// step 1: create a variable for the new route and set it equal to 'express.Router()
// const [routeName] = express.Router()
// --> MOVED TO 'tourRoutes.js' and 'userRoutes.js' <--

// step 2: use the format below to set the url and the name of the new route that we defined in step 1
// app.use([url], [routeName]) 
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// step 3: update the existing routes with the routeName and a new route
/*
---------------------------
original way:
app
  .route('/api/v1/tours')
new way:
--> MOVED TO 'tourRoutes.js' and 'userRoutes.js' <--
---------------------------
*/

// =====================================
// 5) START SERVER
// =====================================
// --> MOVED TO 'server.js' <--

// export the app so that the server.js file can require it
module.exports = app;




