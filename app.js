// APP.JSON
// ======================================
// everything that is not related to express we will handle outside of app.js

// ANCHOR -- Require Modules --
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const AppError = require('./Utilities/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// ANCHOR -- Initialize Express --
const app = express();

// you can call this to see the current environment mode
console.log(`NODE_ENV: ${process.env.NODE_ENV}`); // environment variables accessed via 'process.env'

// SECTION == Global Middle-Ware ==

// ANCHOR -- Initialize Helmet --
// security http headers
app.use(helmet());

// ANCHOR -- Initialize Morgan --
//check the environment mode before running morgan
// development logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ANCHOR -- Initialize Rate Limiter --
// limit requests from the same IP address
// The limiter is an object of options
const limiter = rateLimit({
  max: 100, // maximum number of requests user can make
  windowMs: 60 * 60 * 1000, // window of time user can make the max number of requests
  message: 'Too many requests from this IPm please try again later.', // rate limit reached error message
});
// how intialize the limiter with all routes with '/api' in it
app.use('/api', limiter); // app.use(route,limiter);

// ANCHOR -- Connect Files --
// connect json and the public file for useage
// body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })); // sets the limit of the body to 10kb

// ANCHOR -- Data Sanitization --

// prevent NoSQL query injection
// this will look at the req.body, req.queryString, and req.params and filter out all '$' and '.'
app.use(mongoSanitize());

// prevents XSS attacks
app.use(xss());

// prevents parameter pollution
// an attacker may try to break your app by sending a query that your app isnt equipped to handle
// by duplicating certain query options, like the sort query option
// the whitelist option allows you to duplicate certain query options
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// serving static files
app.use(express.static(`${__dirname}/public`));

// ANCHOR -- Test Middleware --
// calls a basic middleware that logs a message
app.use((req, res, next) => {
  console.log('Hello from the middleware!');
  next();
});

// ANCHOR -- Date Middleware --
// returns the current date/time
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log(req.headers); // get access to the headers in express
  next();
});

// SECTION == Initialize Routers ==

// ANCHOR -- Connect Mounted Routes --
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// ANCHOR -- Handle Unhandled Routes --
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server :(`, 404));
});

// SECTION ==  Global Error Handler ==
app.use(globalErrorHandler);

// SECTION == Export ==
module.exports = app;
