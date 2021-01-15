// === API QUERYING FEATURES ===
// the api features class is called inside query functions in the controllers folder
// this class allows those functions to altar the incoming query from the user

// ANCHOR -- Create the Class --
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // ANCHOR -- Filter Function --
  filter() {
    // console.log(this.queryString);
    // create a hard copy of the query by using destructuring within a newly created object
    // so we dont altar the original query object
    const preQuery = { ...this.queryString };

    // create the list of query fields we want to exclude from our preQuery
    const excludedFields = ['page', 'sort', 'limit', 'fields'];

    // loop through the preQuery and delete all exluded fields that appear
    excludedFields.forEach((el) => {
      delete preQuery[el];
    });

    // Advanced Filtering
    let queryString = JSON.stringify(preQuery);
    queryString = queryString.replace(
      // regular expression
      // will replace a 'gte' with a '$gte'
      /\b(gte|gt|lte|lt)\b/g, // list the expressions to look for. add 'g' to replace all
      (match) => `$${match}` // use this callback function syntax: template literals
    );

    // sets the query object to the altared queryString
    this.query = this.query.find(JSON.parse(queryString));

    // return the filtered query object
    return this;
  }

  // ANCHOR -- Sort Function --
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      // add a default sorting method to the query
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  // ANCHOR -- Limit Fields --
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      // add a default query limiter
      this.query = this.query.select('-__v');
    }

    return this;
  }

  // // ANCHOR -- Add Pagination --
  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

// ANCHOR -- Export --
module.exports = APIFeatures;
