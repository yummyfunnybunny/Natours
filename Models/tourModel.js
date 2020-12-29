// ANCHOR -- Require Modiles --
const mongoose = require('mongoose');
const slugify = require('slugify');
const User = require('./userModel');
// const validator = require('validator');

// ANCHOR -- Create Tour Schema --
const tourSchema = new mongoose.Schema(
  {
    // Schema Definition (the model)
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxLength: [40, 'Tour name is too long'],
      minLength: [10, 'Tour name is too short'],
      // all we do is call the validator that we want to use inside the validator variable that we set at the top
      //validate: [validator.isAlpha, 'Tour name must only contain characters'],
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
      enum: {
        values: ['easy', 'medium', 'difficult', 5],
        message: 'Difficulty can only be: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be greater than 1.0'],
      max: [5, 'Rating must be less than or equal to 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // 'this' keyword only points to current doc on NEW document SAVE, not UPDATE or DELETE
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) cant be higher than the price',
      },
    },
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
      select: false, // stops this field from being projected to the client
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // guides: Array,
    // this is how to set up "Referencing" (data modeling)
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    // Schema Options
    toJSON: { virtuals: true }, // this tells the schema to include virtual properties when outputted to JSON
    toObject: { virtuals: true }, // this tells the schema to include virtual properties when outputted to objects
  }
);

// SECTION == Virtual Properties ==
// virtual properties are created each time a request is made
// we cannot use virtual properties as part of a query, since they are not part of the database

// ANCHOR -- Duration Weeks --
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
// !SECTION

// SECTION == Virtual Populate ==

// ANCHOR -- VP Reviews --
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// !SECTION

// SECTION == Document Middle-Ware ==

// ANCHOR -- slugify --
// Pre-Save Hook
// the '.pre()' command will run before .save() and .create(), but NOT before .insertMany()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// ANCHOR -- Embed User Documents inside Tour Documents --
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// ANCHOR -- Example --
// we can have multiple pre/post save hooks...
// this is just an example that will console log a message.
tourSchema.pre('save', function (next) {
  //console.log('Will save document...');
  next();
});

// ANCHOR -- Example --
// Post-Save Hook
// .post() is executed after all .pre() hooks
// the .post() middle-waire has access to the 'doc' argument, which is the document that we just saved to the database
// no longer have the 'this' keyword, but we have the finished document in 'doc'
tourSchema.post('save', function (doc, next) {
  //console.log(doc);
  next();
});

// !SECTION

// SECTION == Query Middle-Ware ==
// the .find() function is what makes this 'query middle-ware' instead of document middle-ware
// other than that, they are exactly the same

// ANCHOR -- Filter Secret Tours --
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

// ANCHOR -- Query Timer --
// since this query middle-ware is the .post() method, it has access to the 'docs' (completed documents)
tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds!`);
  //console.log(docs);
  next();
});

// ANCHOR -- Populate The Guides documents being referenced --
// this is what populates the user data inside of the tour model (data modeling)
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

// !SECTION

// SECTION == Aggregation Middle-Ware ==

// ANCHOR -- Match --
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});

// !SECTION

// ANCHOR -- Create Tour Model --
const Tour = mongoose.model('Tour', tourSchema);

// ANCHOR -- Export Model --
module.exports = Tour;
