// APP.JSON
// ======================================
// everything that is not related to express we will handle outside of app.js
// 1)  REQUIRE MODULES
// a: core modules
const express = require('express');
const morgan = require('morgan');
// b: developer modules
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
// c: 3rd party modules

// 2) CREATE EXPRESS VARIABLE CALLED "APP"
const app = express();

// 3) MIDDLEWARE
console.log(`NODE_ENV: ${process.env.NODE_ENV}`); // environment variables accessed via 'process.env'
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  console.log('Hello from the middleware!');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 4) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// 5) START SERVER
module.exports = app;
