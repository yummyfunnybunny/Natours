// ANCHOR -- Require Modules --
const Tour = require('../Models/tourModel');
const User = require('../Models/userModel');
const Booking = require('../Models/bookingModel');
const catchAsync = require('../Utilities/catchAsync');
const AppError = require('../Utilities/appError');

// SECTION == Function Controllers ==

// ANCHOR -- Get Overview Page --
exports.getOverview = catchAsync(async (req, res) => {
  // 1) get tour data from collection
  const tours = await Tour.find();

  // 2) build Template

  // 3) render that template using tour data from step 1

  res.status(200).render('overview', {
    title: 'All Tours',
    tours: tours,
  });
});

// ANCHOR -- Get Tour Page --
exports.getTour = catchAsync(async (req, res, next) => {
  // 1) get the data for the requested tour (include reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }
  // 3) Render template using data from step 1
  res
    .status(200)
    // .set(
    //   'Content-Security-Policy',
    //   "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    // )
    .render('tour', {
      title: `${tour.name} Tour`,
      tour: tour,
    });
});

exports.getLoginForm = (req, res) => {
  res
    .status(200)
    // .set(
    //   'Content-Security-Policy',
    //   "connect-src 'self' https://cdnjs.cloudflare.com"
    // )
    .render('login', {
      // 'login' is the name of the template we are going to load
      title: 'Log into your account',
    });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your Account',
  });
};

// ANCHOR -- Get My Tours --
// retreives all tours that the current user has booked, and than renders a page identical to the
// overview page, but will only show the tours that the logged-in user has booked
// TODO -- This can greatly be built upon to make better. honestly the way this was done in the lecture
// is pretty stupid
// TODO -- can also perform this exact same function using virtual populate (according to Jonas)
exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  // 2) find tours with the returned IDs
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours: tours,
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser,
  });
});

// !SECTION
