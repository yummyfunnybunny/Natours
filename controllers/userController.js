// ANCHOR == Require Modules ==
const User = require('../Models/userModel');
const catchAsync = require('../Utilities/catchAsync');
const AppError = require('../Utilities/appError');
const factory = require('./handlerFactory');
// const APIFeatures = require('../Utilities/apiFeatures');

// SECTION == Middle-Ware==

// ANCHOR -- Get Me --
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// !SECTION

// SECTION == FUNCTIONS ==

// ANCHOR -- Filter Request --
const filterObj = (reqBody, ...allowedFields) => {
  //  create empty object that will contain the final filtered fields
  const newObj = {};

  // loop through the reqBody keys...
  Object.keys(reqBody).forEach((el) => {
    // for each key in the reqBody, if they match one of the allowed fields...
    if (allowedFields.includes(el)) {
      // add that field to the newObj
      newObj[el] = reqBody[el];
    }
  });
  // return the newObj that now only contains allowed fields
  return newObj;
};

// ANCHOR -- Get All Users --
exports.getAllUsers = factory.getAll(User);

// ANCHOR -- Get User --
exports.getUser = factory.getOne(User);

// ANCHOR -- Update User --
// do not update passwords with this!
exports.updateUser = factory.updateOne(User);

// ANCHOR -- Delete User --
exports.deleteUser = factory.deleteOne(User);

// ANCHOR -- Update Me --
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        `This route is not for password updates. Please use /updatePassword.`,
        400
      )
    );
  }

  // 2) filtered out unwanted fields that we dont want to update
  const filteredBody = filterObj(req.body, 'name', 'email');

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  // 4) send success response
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

// ANCHOR -- Delete Me --
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// ANCHOR -- Create User --
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined... Please use /signup',
  });
};

// !SECTION
