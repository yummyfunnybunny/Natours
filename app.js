// APP.JSON
// ======================================
// everything that is not related to express we will handle outside of app.js

// == 1) require modules ==
// a: core modules
const express = require('express');
const morgan = require('morgan');
// b: developer modules
const AppError = require('./Utilities/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
// c: 3rd party modules

// == 2) create the express variable ==
const app = express();

// == 3) Middle-Ware ==
// you can call this to see the current environment mode
console.log(`NODE_ENV: ${process.env.NODE_ENV}`); // environment variables accessed via 'process.env'

//check the environment mode before running morgan
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// connect json and the public file for useage
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

// calls a basic middleware that logs a message
// app.use((req, res, next) => {
//   console.log('Hello from the middleware!');
//   next();
// });

// returns the current date/time
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log(req.headers); // get access to the headers in express
  next();
});

// == 4) Connect the Routers ==
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// == 5) Handle all un-handled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server :(`, 404));
});

// global error handler
app.use(globalErrorHandler);

// == 6) Export the app to server.js ==
module.exports = app;
