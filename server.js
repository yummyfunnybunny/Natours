// REQURE MODILES
const dotenv = require('dotenv');
dotenv.config({path: './config.env'});  // syntax for requiring the config.env file
const app = require('./app');




// create a variable for the port
const port = process.env.PORT || 3000;

// set the listen handler using the 'port' variable
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// NOTE: routing means "how a server responds to a certain client request"