// ANCHOR -- Create App Error --
class AppError extends Error {
  constructor(message, statusCode) {
    // 'message' is the only parameter that the built-in Error constructor will accept
    super(message); // this line will automatically set the 'message' parameter to the message passed through in app.js

    this.statusCode = statusCode;

    // for 'this.status, use 'startsWith()' to check if the status code starts with 4
    // than use a ternary operator to set the correct status based on the result of 'startsWith()'
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    // we add this variable so later on we can test the error to see if it is an operational or a programming error
    this.isOperational = true;

    // this line of code removes the Error part of the stacktrace
    Error.captureStackTrace(this, this.constructor);
  }
}

// ANCHOR -- Export --
module.exports = AppError;
