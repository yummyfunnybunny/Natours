// ANCHOR -- Require Modules --
const Stripe = require('stripe'); //(process.env.STRIPE_SECRET_KEY);
const Tour = require('../Models/tourModel');
const Booking = require('../Models/bookingModel');
const catchAsync = require('../Utilities/catchAsync');
const factory = require('./handlerFactory');
// const AppError = require('../Utilities/appError');

// SECTION == Middleware ==
// !SECTION

// SECTION == Functions ==

// ANCHOR -- Get Checkout Session --
exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Set up the secret key from your config file into stripe
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  // 2) Get the tour that we are about to book
  const tour = await Tour.findById(req.params.tourId);

  // 3) Create checkout session
  // 3.A) info about the stripe session itself
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    // 3.B) info about the item that is about to be purchased
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`], // TODO this will need to be updated once the website is deployed
        amount: tour.price * 100,
        currency: 'usd',
        quantity: 1,
      },
    ],
  });

  // 4) Create session as response
  res.status(200).json({
    status: 'success',
    session: session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // this is a temporary fix. it is insecure. anyone can currently make a booking without paying
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) return next();

  await Booking.create({ tour, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
  // originalURL = `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
// !SECTION
