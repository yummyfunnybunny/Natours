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
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// ANCHOR -- Send Production Errors --
// sends the production environment errors
const sendErrorProd = (err, res) => {
  // Operational error that we trust, send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    // Programming or other unknown error, don't leak error details to client
  } else {
    // Log errors
    console.error('❌ ERROR ❌:', err);
    // Send generic erroe message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

// SECTION == Exports ==
module.exports = (err, req, res, next) => {
  // set the statusCode to what was passed through, or the default
  err.statusCode = err.statusCode || 500;
  // set the status to what was passed through, or the default
  err.status = err.status || 'error';

  // we are in development, send full detailed error message to the developer
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);

    // We are in production, send a limited error message to the user
  } else if (process.env.NODE_ENV === 'production') {
    // make a copy of the err object through desctructuring
    let error = { ...err };

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
    sendErrorProd(error, res);
  }
};
