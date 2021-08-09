// ANCHOR -- Require Modules --
const crypto = require('crypto');
const { promisify } = require('util'); // built-in node module
const jwt = require('jsonwebtoken');
const User = require('../Models/userModel');
const catchAsync = require('../Utilities/catchAsync');
const AppError = require('../Utilities/appError');
const Email = require('../Utilities/email');

// ANCHOR -- Sign Token --
// -- used by: createSendToken
const signToken = (id) => {
  return jwt.sign(
    {
      _id: id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
};

// ANCHOR -- Create Send Token --
// -- used by: signUp, login, resetPassword, updatePassword
const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  // define the jwt cookie
  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    //secure: true, // this means the cookie will only be sent via encrypted connection (https)
    httpOnly: true, // this means the cookie cannot be accessed or modifed in anyway by the browser (precents cross-side-scripting attacks)
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });

  // set the password to undefined so it does not show up in the response to the client
  user.password = undefined;

  // send success response
  res.status(statusCode).json({
    status: 'success',
    token, // here is the jwt we created above, sending it back to the user
    data: {
      user: user,
    },
  });
};

// ANCHOR -- Signup User --
exports.signup = catchAsync(async (req, res, next) => {
  // 1) save all of the info from req.body into a model object 'newUser'
  const newUser = await User.create(req.body);
  console.log('signup 3');

  // create the url, and send the welcome email to the newly signed-up user
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();

  // 2) Create, Sign, and Send Token To Client
  createSendToken(newUser, 201, req, res);
});

// ANCHOR -- Login User --
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  // 2) check if user exists and if password is correct
  const user = await User.findOne({ email: email }).select('password');
  // console.log(user);
  // if user not not exist, or if the passwords don't match
  // we put the password check inside of this if/else statement because otherwise we'd get
  // an error if the user did not exist, due to the password check requiring a valid user
  // in order to perform the password check
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect Email or password', 401));
  }

  // 3) if everything is ok, send token to client
  createSendToken(user, 200, req, res);
});

// ANCHOR -- Logout User --
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now()),
    // expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
  });
};

// ANCHOR -- Protect --
exports.protect = catchAsync(async (req, res, next) => {
  // 1) - check if JWT exists -
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];

    // check for a jwt in the cookies
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  // throw error if there is no token
  if (!token) {
    return next(
      new AppError(
        'Unauthorized access. You must be logged in to gain access',
        401
      )
    );
  }
  // 2) - Verification token -
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded); // output: { _id, iat, exp } - id of document, issued at, expires at

  // 3) - check if user still exists -
  const freshUser = await User.findById(decoded._id);
  if (!freshUser) {
    return next(
      new AppError('The user belonging to this token no longer exists', 401)
    );
  }
  // 4) - Check if user changed password after the token was issued -
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        `User has changed password since token was created. please log in again.`,
        401
      )
    );
  }
  // console.log(req.user);
  // 5) - grant access to protected route -
  req.user = freshUser; // we do this line because the req.user is what gets passed from middleware to middleware
  res.locals.user = freshUser;
  // console.log(req.user);
  next();
});

// ANCHOR -- Is Logged In --
// only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      // console.log(decoded); // output: { _id, iat, exp } - id of document, issued at, expires at

      // 2) - check if user still exists -
      const freshUser = await User.findById(decoded._id);
      if (!freshUser) {
        return next();
      }

      // 3) - Check if user changed password after the token was issued -
      if (freshUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // 4) - there is a logged in user
      res.locals.user = freshUser; // all pug templates have access to 'res.locals'
      return next();
    } catch (err) {
      return next();
    }
  }
  // there is no logged in user, call 'next'
  next();
};

// ANCHOR -- Restrict access --
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    console.log(req);
    // roles is an array: ['lead-guide', 'admin']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      ); // 403 = forbidden
    }
    next();
  };
};

// ANCHOR -- Forgot Password --
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with that Email address.', 404)); // 404 = not found
  }

  // 2) Generate a random reset token and save it to the current user
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send Email with Token To User's Email
  try {
    // build the URL with the resetToken at the end; this will go in the email
    // req.protocol = http
    // req.get('host') = '127.0.0.1:3000' or 'localhost:3000'
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    // attempt to officially send the email
    await new Email(user, resetURL).sendPasswordReset();

    // send success response to the client
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
    // send error response to the client
  } catch (err) {
    // setting the two below model fields to undefined will prevent them from being saved to the
    // database. we don't need them anymore.
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    // save updated info to the document, turning off validation checks
    await user.save({ validateBeforeSave: false });

    // send error message and statusCode
    return next(
      new AppError(`There was an error sending the email. Try again later!`),
      500
    );
  }
});

// ANCHOR -- Reset Password --
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) get user based on the token

  // re-hash the un-hashed token that was provided in the email to the user, now in the url
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // find the user with the matching hashedToken
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) if token has not expired, and thers is a user, set the new password
  if (!user) {
    return next(new AppError(`Token is invalid or has expired`, 400));
  }

  // 3) Update the changedPasswordAt property for the user
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save(); // we don't turn off validation here, because we WANT to validate the new password

  // 4) log the user in, send JWT to client
  createSendToken(user, 200, req, res);
});

// ANCHOR -- Update Password --
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get the user from COLLECTION
  // console.log(req.body);
  const user = await User.findOne(req.user._id).select('+password');

  // 2) Check if POSTed password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(
      new AppError('Your current password is wrong', 401) // 401 = unauthorized
    );
  }
  // 3) Update the password
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm;
  await user.save();

  // 4) Log user in, send JWT
  createSendToken(user, 200, req, res);
});
