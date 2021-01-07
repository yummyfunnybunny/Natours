// ANCHOR -- Require Modules --
const AppError = require('../Utilities/appError');

// SECTION == Functions ==

// ANCHOR -- Cast Error --
// function handler for incorrect ID search
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

// ANCHOR -- Duplicate Fields --
// function handler for duplicate document name
const handleDuplicateFieldsDB = (err) => {
  // console.log(err.errmsg);
  // console.log(Object.values(err.keyValue));
  // const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const value = Object.values(err.keyValue);
  const message = `Duplicate field value ${value}. Please use another value`;
  return new AppError(message, 400);
};

// ANCHOR -- validation errors --
// function handler for mongoose validation errors
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// ANCHOR -- Invalid Json Web Token --
const handleJWTError = (err) => {
  const message = `❌ ${err.name} ❌ You are trying to log in with an invalid token. Please login again.`;
  return new AppError(message, 401);
};

// ANCHOR -- Expired Json Web Token --
const handleJWTExpired = (err) => {
  const message = `❌ ${err.name} ❌ You have not logged in recently enough. Please log in again`;
  return new AppError(message, 401);
};

// ANCHOR -- Send Development Error --
// sends the development environment errors
const sendErrorDev = (err, req, res) => {
  // A) API error handling
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  // B) rendered website
  console.error('❌ ERROR ❌:', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};

// ANCHOR -- Send Production Errors --
// sends the production environment errors
const sendErrorProd = (err, req, res) => {
  // A) API error handling
  if (req.originalUrl.startsWith('/api')) {
    // Operational error that we trust, send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // B) Programming or other unknown error, don't leak error details to client
    // 1) Log errors
    console.error('❌ ERROR ❌:', err);
    // 2) Send generic erroe message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
  // B) Rendered Website
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }
  // Programming or other unknown error, don't leak error details to client
  // Log errors
  console.error('❌ ERROR ❌:', err);
  // Send generic erroe message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.',
  });
};

// SECTION == Exports ==
module.exports = (err, req, res, next) => {
  // set the statusCode to what was passed through, or the default
  err.statusCode = err.statusCode || 500;
  // set the status to what was passed through, or the default
  err.status = err.status || 'error';

  // we are in development, send full detailed error message to the developer
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);

    // We are in production, send a limited error message to the user
  } else if (process.env.NODE_ENV === 'production') {
    // make a copy of the err object through desctructuring
    let error = { ...err };
    error.message = err.message;

    // incorrect ID error check
    if (err.name === 'CastError') {
      error = handleCastErrorDB(error);
    }

    // duplicate field error check
    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }

    // Validation Error Check
    if (error._message === 'Validation failed') {
      error = handleValidationErrorDB(error);
    }

    // Invalid JWT
    if (error.name === 'JsonWebTokenError') {
      error = handleJWTError(error);
    }

    // Token Expired Error
    if (error.name === 'TokenExpiredError') {
      error = handleJWTExpired(error);
    }
    sendErrorProd(error, req, res);
  }
};
