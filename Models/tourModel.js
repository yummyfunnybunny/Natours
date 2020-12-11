// REQURE MODULES
const mongoose = require('mongoose');
const slugify = require('slugify');

// CREATE SCHEMA
const tourSchema = new mongoose.Schema(
  {
    // Schema Definition (the model)
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a maximum group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have an image cover'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
  },
  {
    // Schema Options
    toJSON: { virtuals: true }, // this tells the schema to include virtual properties when outputted to JSON
    toObject: { virtuals: true }, // this tells the schema to include virtual properties when outputted to objects
  }
);

// == Define our Virtual Properties ==
// virtual properties are created each time a request is made
// we cannot use virtual properties as part of a query, since they are not part of the database
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// == Document Middle-Ware ==
// PRE-SAVE HOOK
// the '.pre()' command will run before .save() and .create(), but NOT before .insertMany()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// we can have multiple pre/post save hooks...
// this is just an example that will console log a message.
tourSchema.pre('save', function (next) {
  //console.log('Will save document...');
  next();
});

// POST-SAVE HOOK
// .post() is executed after all .pre() hooks
// the .post() middle-waire has access to the 'doc' argument, which is the document that we just saved to the database
// no longer have the 'this' keyword, but we have the finished document in 'doc'
tourSchema.post('save', function (doc, next) {
  //console.log(doc);
  next();
});

// CREATE MODEL
const Tour = mongoose.model('Tour', tourSchema);

// EXPORT
module.exports = Tour;
