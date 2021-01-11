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
const AppError = require('./Utilities/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewsRoutes');

// ANCHOR -- Initialize Express --
const app = express();

// ANCHOR -- Initialize Template Engine --
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// you can call this to see the current environment mode
console.log(`NODE_ENV: ${process.env.NODE_ENV}`); // environment variables accessed via 'process.env'

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
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'https://*.mapbox.com', 'https://*.stripe.com'],
      baseUri: ["'self'"],
      fontSrc: ["'self'", 'https:', 'data:'],
      imgSrc: ["'self'", 'https://www.gstatic.com'],
      scriptSrc: [
        "'self'",
        'https://*.stripe.com',
        'https://cdnjs.cloudflare.com',
        'https://api.mapbox.com',
        'https://*.mapbox.com',
        'https://js.stripe.com',
        "'blob'",
      ],
      frameSrc: ["'self'", 'https://*.stripe.com'],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
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
        'https://js.stripe.com',
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

// ANCHOR -- Parsers --
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
  console.log(req.cookies);
  next();
});

// !SECTION

// ANCHOR -- Mounted Routes --
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// !SECTION

// ANCHOR -- Handle Unhandled Routes --
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server 🐟`, 404));
});

// ANCHOR --  Global Error Handler --
app.use(globalErrorHandler);

// ANCHOR -- Export --
module.exports = app;
