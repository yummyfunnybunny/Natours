// == Require Modules/Packages ==
const User = require('../Models/userModel');
const APIFeatures = require('../Utilities/apiFeatures');
const catchAsync = require('../Utilities/catchAsync');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  // await the finalquery to the new constant 'users'
  const users = await User.find();

  // Send Response
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined...',
  });
};

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined...',
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined...',
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined...',
  });
};
