// == Require Modules/Packages ==
const User = require('../Models/userModel');
const catchAsync = require('../Utilities/catchAsync');
//
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});
