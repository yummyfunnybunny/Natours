// REQURE MODULES
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Handle uncaught Exception
process.on('uncaughtException', (err) => {
  console.log('UNHANDLED ESCEPTION! shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// syntax for requiring the config.env file (which adds everything in that file to 'process.env')
// this must be placed above "app" in order to log the requests we make properly
dotenv.config({
  path: './config.env',
});

const app = require('./app');

// tells you whether you are running in a 'development' or 'production' environment
console.log(`current environment: ${app.get('env')}`);

// connect to the MongoDB Atlas cluster that you specified in the 'config.env' file
// use the 'replace' function to replace "<PASSWORD>" with the actual password from DATABASE_PASSWORD
// in the 'config.env' file
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// now connect to the mongoDB database we declared above
mongoose
  .connect(DB, {
    // these are just to handle deprecation warnings, so copy/paste this in other projects with mongooese
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  // we can just now use '.then' to log that the connection was successful
  .then(() => console.log('DB connection successful!'));

// create a variable for the port
const port = process.env.PORT || 3000;

// set the listen handler using the 'port' variable
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// Global Unhandled promise rejection
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! shutting down...');
  console.log(err.name, err.message);

  // gracefully shut down the server
  server.close(() => {
    // shuts down the application
    process.exit(1);
  });
});
