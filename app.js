const fs = require('fs');
const express = require('express');

const app = express();  // common practice to create a variable called "app" that is set to the newly requirec express

// MIDDLEWARE - function that can modifer the incoming request data (stands between the request and the response)
app.use(express.json());

// GET ROOT HANDLER
// -----------------------------------------
app.get('/', (request, response) => {
  // set the response that is 'sent' back from the server
  // also, you can use the 'status' method to set the status type of the response (in this case it is '200' for 'success')
  // response.status(200).send('Hello from the server side!');

  // you can also send json requests back from the server like this:
  // the 'json' method automatically sets the content type to json, so we do not need to manually set that up
  // like we did previously when we were not using express methods
  response.status(200).json({message: 'Hello from the server side!', app: 'Natours'});
});

// BASIC POST REQUEST HANDLER
// -----------------------------------------
app.post('/', (request, response) => {
  response.send('You can post to this endpoint...');
});

// save the data we want into a variable in a synchronous way (since it does not matter in top-level code)
// we will parse this data into a JSON file right away
const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

// GET ROUTE HANDLER
// -----------------------------------------
app.get('/api/v1/tours', (req,res) => {
  // useful to list the 'status' even if its not needed
  // we will be using the 'JSend' response format with 'enveloping':
  res.status(200).json({
    status: 'success',
    // the "results" response is handy when a response contains arrays or multiple objects, but is not
    // part of the RESTFUL API common practices, just useful for us :)
    results: tours.length,
    data: {
      // in ES6, we do not need to specify the key and value if they have the same name. you can simply just write:
      // "tours" below, instead of "tours: tours".
      tours: tours
      // if we saved the JSON data above into a variable called "x" instead of "tours", we would have to write out:
      // "tours: x", because enveloping name we want is different from the variable with the saved data that we want
    }
  })
});

// GET REQUEST WITH ID HANDLER
// -----------------------------------------
// notice the ':id' at the end of the url, that syntax will check for a variable, in this case, the var "id"
app.get('/api/v1/tours/:id', (req,res) => {
  // variables in the URL are called 'parameters', and they are stored inside 'req.params'
  
  console.log(req.params);
  res.status(200).json({
    status: 'success',
    // results: tours.length,
    // data: {
    //   tours
    // }
  })
});


// POST ROUTE HANDLER
// -----------------------------------------
app.post('/api/v1/tours', (req, res) => {
  // we do 'req.body' because body is the property that is going to be available on the request...
  // console.log(req.body);

  // create an ID for the new tours entry:
  const newId = tours[tours.length-1].id + 1;

  // create a new object using the "Object.assign" method, which takes two existing objects (newId & req.body), and
  // merges them together into one object
  const newTour = Object.assign({id: newId}, req.body);

  // Push the new tour object into the tours array
  tours.push(newTour);

  // write the 'tours-simple' database to the server
  // when sending data to a web server, the data has to be a string, so we use 'JSON.stringify' to turn the 'tours'
  // array into a string before finalizing the post request
  fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), (err) => {
    // status 201 = "created" - we just 'created' a new tour, so this is appropriate
    res.status(201).json({
      //  once again, we use the JSent format
      status: 'success',
      data: {
        tour: newTour
      }
    });
  });

  // must have a response of some kind to complete the request/response cycle
  // res.send("Done");
});


// create a variable for the port
const port = 3000;

// SET LISTENING HANDLER
// -----------------------------------------
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// NOTE: routing means "how a server responds to a certain client request"




