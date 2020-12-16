// == Require Modules/Packages ==
const jwt = require('jsonwebtoken');
const User = require('../Models/userModel');
const catchAsync = require('../Utilities/catchAsync');

// == Signup User ==
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  // create the token using JWT. jwt.sign({ payload }, secret, sign-options)
  const token = jwt.sign(
    {
      id: newUser._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );

  res.status(201).json({
    status: 'success',
    token, // here is the jwt token we created above, sending it back to the user
    data: {
      user: newUser,
    },
  });
});
