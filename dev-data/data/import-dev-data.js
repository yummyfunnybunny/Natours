// REQURE MODULES
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../Models/tourModel');

// syntax for requiring the config.env file (which adds everything in that file to 'process.env')
dotenv.config({
  path: './config.env',
});

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

// READ JSON FILE
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

// IMPORT DATA INTO MongoDB
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM COLLECTION
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// run either importData or deleteData, depenind on what you type in the command line
// essentially, we created our own little functions to run in the command line, completely separate from
// the rest of our application.
// here are the two commands you will run:
/*
  node dev-data/data/import-dev-data.js --import
  node dev-data/data/import-dev-data.js --delete
*/
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

console.log(process.argv);
/*
Process.env:
used to get the arguments passed to the node.js process when run in the command line
*/
