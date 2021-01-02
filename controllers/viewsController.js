// ANCHOR -- Require Modules --
const Tour = require('../Models/tourModel');
const catchAsync = require('../Utilities/catchAsync');

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
exports.getTour = catchAsync(async (req, res) => {
  // 1) get the data for the requested tour (include reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  // 2) build Template

  // 3) Render template using data from step 1
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour: tour,
  });
});

// !SECTION
