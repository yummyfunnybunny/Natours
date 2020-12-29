// ANCHOR -- Require Modules --
const mongoose = require('mongoose');
// const User = require('./userModel');
// const Tour = require('./tourModel');
// const slugify = require('slugify');

// ANCHOR -- Create Review Schema --
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
      minLength: [40, 'Your review must have at least 40 characters'],
      maxLength: [1000, 'Your review cannot be longer than 1000 characters'],
    },
    rating: {
      type: Number,
      required: [true, 'Your review must have a rating'],
      min: [1, 'Your review must be between 1-5'],
      max: [5, 'Your review must be between 1-5'],
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

// SECTION == Virtual Properties ==
// !SECTION

// SECTION == Document Middle-Ware ==
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

// !SECTION

// SECTION == Aggregation Middle-Ware ==
// !SECTION

// SECTION == Instance Methods ==
// !SECTION

// ANCHOR -- Create Review Model --
const Review = mongoose.model('Review', reviewSchema);

// ANCHOR -- Export Model --
module.exports = Review;
