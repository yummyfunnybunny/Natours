// ANCHOR -- Require Modules --
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// ANCHOR -- Handle uncaught Exception --
process.on('uncaughtException', (err) => {
  console.log('💥 UNHANDLED EXCEPTION 💥 shutting down server...');
  console.log(err.name, err.message);
  process.exit(1);
});

// ANCHOR -- Initialize Config --
// syntax for requiring the config.env file (which adds everything in that file to 'process.env')
// this must be placed above "app" in order to log the requests we make properly
dotenv.config({
  path: './config.env',
});

// ANCHOR -- Require App --
const app = require('./app');

// tells you whether you are running in a 'development' or 'production' environment
console.log(`current environment: ${app.get('env')}`);

// ANCHOR -- Connect MONGODB --

// 1) Declare the MongoDB Atlas cluster that you specified in the 'config.env' file
// use the 'replace' function to replace "<PASSWORD>" with the actual password from DATABASE_PASSWORD
// in the 'config.env' file
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// 2) Now connect to the mongoDB database we declared above
mongoose
  .connect(DB, {
    // these are just to handle deprecation warnings, so copy/paste this in other projects with mongooese
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  // we can now just use '.then' to log that the connection was successful
  .then(() => console.log('DB connection successful!'));

// ANCHOR -- Listen to Server --

// 1) create a variable for the port
const port = process.env.PORT || 3000;

// 2) set the listen handler using the 'port' variable
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// ANCHOR -- Global Unhandled Promise Rejection --
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! shutting down...');
  console.log(err.name, err.message);

  // gracefully shut down the server
  server.close(() => {
    // shuts down the application
    process.exit(1);
  });
});

// ANCHOR -- Handle SIGTERM Signal --
// this will gracefully shutdown the server whenever heroku sends its scheduled SIGTERM signal to the application
// It's a reset thing...
process.on('SIGTERM', () => {
  console.log('SIGTERM RECEIVED. Shutting down gracefully! 💃');
  server.close(() => {
    console.log('💥 Process terminated! 💥');
  });
});
