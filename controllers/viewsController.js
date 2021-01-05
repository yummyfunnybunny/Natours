// ANCHOR -- Require Modules --
const Tour = require('../Models/tourModel');
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
  // 2) build Template

  // 3) Render template using data from step 1
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com/ https://api.mapbox.com/ 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('tour', {
      title: `${tour.name} Tour`,
      tour: tour,
    });
});

exports.getLoginForm = catchAsync(async (req, res, next) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "script-src 'self' https://cdnjs.cloudflare.com/ajax/libs/axios/0.21.0/axios.min.js 'unsafe-inline' 'unsafe-eval';"
    )
    .render('login', {
      // 'login' is the name of the template we are going to load
      title: 'Log into your account',
    });
});

// !SECTION
