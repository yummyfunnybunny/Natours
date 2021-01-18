// APP.JS
// ======================================
// everything that is not related to express we will handle outside of app.js

// ANCHOR -- Require Modules --
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const helmet = require('helmet');
const csp = require('express-csp');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const AppError = require('./Utilities/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewsRoutes');

// ANCHOR -- Initialize Express --
const app = express();

// ANCHOR -- Enable Proxy --
// this is necessary for heroku to work
app.enable('trust proxy');

// ANCHOR -- Initialize Template Engine --
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// you can call this to see the current environment mode
// console.log(`NODE_ENV: ${process.env.NODE_ENV}`); // environment variables accessed via 'process.env'

// SECTION == Global Middle-Ware ==

// ANCHOR -- serving static files --
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

// ANCHOR -- Initialize Helmet --
// security http headers
// app.use(helmet());
// ---------------------------
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'", 'https://*.mapbox.com', 'https://*.stripe.com'],
//       baseUri: ["'self'"],
//       fontSrc: ["'self'", 'https:', 'data:'],
//       imgSrc: ["'self'", 'https://www.gstatic.com'],
//       scriptSrc: [
//         "'self'",
//         'https://*.stripe.com',
//         'https://cdnjs.cloudflare.com',
//         'https://api.mapbox.com',
//         'https://*.mapbox.com',
//         'https://js.stripe.com',
//         "'blob'",
//       ],
//       frameSrc: ["'self'", 'https://*.stripe.com'],
//       objectSrc: ["'none'"],
//       upgradeInsecureRequests: [],
//     },
//   })
// );
// -------------------------------
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", 'data:', 'blob:', 'https:', 'ws:'],
        baseUri: ["'self'"],
        fontSrc: ["'self'", 'https:', 'data:'],
        scriptSrc: [
          "'self'",
          'https:',
          'http:',
          'blob:',
          'https://*.stripe.com',
          'https://*.mapbox.com',
          'https://js.stripe.com',
          'https://m.stripe.network',
          'https://*.cloudflare.com',
        ],
        frameSrc: ["'self'", 'https://js.stripe.com'],
        objectSrc: ["'none'"],
        styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
        workerSrc: [
          "'self'",
          'data:',
          'blob:',
          'https://*.tiles.mapbox.com',
          'https://api.mapbox.com',
          'https://events.mapbox.com',
          'https://m.stripe.network',
        ],
        childSrc: ["'self'", 'blob:'],
        imgSrc: ["'self'", 'data:', 'blob:'],
        formAction: ["'self'"],
        connectSrc: [
          "'self'",
          "'unsafe-inline'",
          'data:',
          'blob:',
          'https://*.stripe.com',
          'https://*.mapbox.com',
          'https://*.cloudflare.com/',
          'https://bundle.js:*',
          'ws://127.0.0.1:*/',
        ],
        upgradeInsecureRequests: [],
      },
    },
  })
);

csp.extend(app, {
  policy: {
    directives: {
      'default-src': ['self'],
      'style-src': ['self', 'unsafe-inline', 'https:'],
      'font-src': ['self', 'https://fonts.gstatic.com'],
      'script-src': [
        'self',
        'unsafe-inline',
        'data',
        'blob',
        'https://m.stripe.network',
        'https://js.stripe.com',
        'https://*.stripe.com',
        'https://*.mapbox.com',
        'https://*.cloudflare.com/',
        'https://bundle.js:8828',
        'ws://localhost:56558/',
      ],
      'worker-src': [
        'self',
        'unsafe-inline',
        'data:',
        'blob:',
        'https://m.stripe.network',
        'https://*.stripe.com',
        'https://*.mapbox.com',
        'https://*.cloudflare.com/',
        'https://bundle.js:*',
        'ws://localhost:*/',
      ],
      'frame-src': [
        'self',
        'unsafe-inline',
        'data:',
        'blob:',
        'https://js.stripe.com',
        'https://*.stripe.com',
        'https://*.mapbox.com',
        'https://*.cloudflare.com/',
        'https://bundle.js:*',
        'ws://localhost:*/',
      ],
      'img-src': [
        'self',
        'unsafe-inline',
        'data:',
        'blob:',
        'https://*.stripe.com',
        'https://*.mapbox.com',
        'https://*.cloudflare.com/',
        'https://bundle.js:*',
        'ws://localhost:*/',
      ],
      'connect-src': [
        'self',
        'unsafe-inline',
        'data:',
        'blob:',
        // 'wss://<HEROKU-SUBDOMAIN>.herokuapp.com:<PORT>/',
        'https://*.stripe.com',
        'https://*.mapbox.com',
        'https://*.cloudflare.com/',
        'https://bundle.js:*',
        'ws://localhost:*/',
      ],
    },
  },
});

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

// ANCHOR -- Initialize Parsers --
// body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })); // sets the limit of the body to 10kb
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // this allows us to parse data coming from a url-encoded HTML form
app.use(cookieParser());

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

// ANCHOR -- Compression --
app.use(compression());

// ANCHOR -- Test Middleware --
// calls a basic middleware that logs a message
app.use((req, res, next) => {
  // console.log('Hello from the middleware!');
  next();
});

// ANCHOR -- Date Middleware --
// returns the current date/time
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log(req.headers); // get access to the headers in express
  // console.log(req.cookies);
  next();
});

// !SECTION

// ANCHOR -- Mounted Routes --
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// !SECTION

// ANCHOR -- Handle Unhandled Routes --
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server 🐟`, 404));
});

// ANCHOR --  Global Error Handler --
app.use(globalErrorHandler);

// ANCHOR -- Export --
module.exports = app;

// TODO
/*
could have added more business logic to the project:
- Adding a restriction so users can only review tours that they have actually booked
- implemented nested booking routes: /tours/:id/bookings -OR- /users/:id/bookings
- improve tour dates: 
  - add particiants and soldout field to each date.
  - a date than becomes like an instance of the tour.
  - then, when a user books a tour, they need to select one of the dates.
  - a new booking will increase the number of participants in the date, until it is fully booked.
  - so when a user wants to book, there must be a slot left in that date instance for the user to move forward.
- implement advanced authentication feaures:
  - confirm user email for a 2-part signup authentication process
  - keep users logged in with refresh tokens
  - 2-factor authentication (text message on phone with code)

front-end additions:
 - create a signup form (very similar to login form)
 - on the tour detail page, if a user has taken a tour, allow them to add a review directly on the website with a form
 - hide the entire booking section on the tour detail page if the current user has already booked the tour
 - also prevent duplicate bookings on the model (very similar to what we did with stopping duplicate reviews)
 - implement 'like tour' functionality
 - create the 'my reviews' page, which has a button on the left side of the accounts panal already
 - for ADMINISTRATORS: create all of the "manage" pages, where they can CRUD tours, users, reviews, and bookings
*/
