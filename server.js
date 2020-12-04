// REQURE MODULES
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({
  path: './config.env',
}); // syntax for requiring the config.env file
console.log(`current environment: ${app.get('env')}`);

// connect to MongoDB Atlas
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
  .connect(DB, {
    // these are just to handle deprecation warnings, so copy/paste this in other projects with mongooese
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DB connection successful!'));

// create a variable for the port
const port = process.env.PORT || 3000;

// set the listen handler using the 'port' variable
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// NOTE: routing means "how a server responds to a certain client request"
