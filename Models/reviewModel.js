// ANCHOR -- Require Modules --
const mongoose = require('mongoose');
// const User = require('./userModel');
const Tour = require('./tourModel');
// const slugify = require('slugify');

// ANCHOR -- Create Review Schema --
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
      // minLength: [40, 'Your review must have at least 40 characters'],
      // maxLength: [1000, 'Your review cannot be longer than 1000 characters'],
    },
    rating: {
      type: Number,
      required: [true, 'Your review must have a rating'],
      // min: [1, 'Your review must be between 1-5'],
      // max: [5, 'Your review must be between 1-5'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    // Schema Options
    toJSON: { virtuals: true }, // this tells the schema to include virtual properties when outputted to JSON
    toObject: { virtuals: true }, // this tells the schema to include virtual properties when outputted to objects
  }
);

// SECTION == Create Indexes ==

//                ({      fields      }, {    options   }
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// !SECTION

// SECTION == Virtual Properties ==
// !SECTION

// SECTION == Document Middle-Ware ==

// ANCHOR -- Calculate Average Rating --
// 'post' does not get access to 'next', so we take that out of the function
reviewSchema.post('save', function () {
  // this points to current review
  this.constructor.calcAverageRatings(this.tour);
});

// !SECTION

// SECTION == Query Middle-Ware ==

// ANCHOR -- Populate Tour Reference --
// this is what populates the user data inside of the tour model (data modeling)
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: ' name photo',
  });
  next();
});

// ANCHOR -- Access Document --
// since Query Middleware does not initially have access to the document we are working with, we need to use
// this function to find the document we are working with in order to gain access to it
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.review = await this.findOne();
  console.log(this.review);
  next();
});

// ANCHOR -- --
reviewSchema.post(/^findOneAnd/, async function () {
  await this.review.constructor.calcAverageRatings(this.review.tour);
});

// !SECTION

// SECTION == Aggregation Middle-Ware ==
// !SECTION

// SECTION == Instance Methods ==
// instance methods are used on invididual documents, and not on the model itself
// !SECTION

// SECTION == Static Methods ==
// static methods are used on the model itself, and not on individual documents

// ANCHOR -- Calculate Average Ratings --
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  // use aggregate to calculate the ratings statistics
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  // update the tour document with the newly calculated statistics,
  // or set them to their default if there are no reviews
  if (stats.length > 0) {
    // set to the calculated statistics based on existing reviews
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    // set to default because there are no reviews
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

// !SECTION

// ANCHOR -- Create Review Model --
const Review = mongoose.model('Review', reviewSchema);

// ANCHOR -- Export Model --
module.exports = Review;
