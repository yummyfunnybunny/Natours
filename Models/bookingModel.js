// ANCHOR -- Require Modules --
const mongoose = require('mongoose');

// ANCHOR -- Create The User Schema --
const bookingSchema = new mongoose.Schema({
  // the bookingModel has a parent-child relationship with the tourModel and the userModel
  // the bookingModel is the child in both cases
  // we create a reference to the tour model and user model like this:
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a Tour'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a User'],
  },
  price: {
    type: Number,
    required: [true, 'Booking must have a price'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    type: Boolean,
    default: true,
  },
});
// SECTION == Create Indexes ==
// !SECTION

// SECTION == Virtual Properties ==
// !SECTION

// SECTION == Document Middle-Ware ==
// !SECTION

// SECTION == Query Middle-Ware ==

// ANCHOR -- Populate User & Tour --
bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({
    path: 'tour',
    select: 'name',
  });
  next();
});
// !SECTION

// SECTION == Aggregation Middle-Ware ==
// !SECTION

// SECTION == Instance Methods ==
// !SECTION

// ANCHOR -- Create The User Model --
const Booking = mongoose.model('Booking', bookingSchema);

// ANCHOR -- Export The User Model --
module.exports = Booking;
