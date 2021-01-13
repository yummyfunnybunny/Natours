// ANCHOR == Require Modules ==
const multer = require('multer');
const sharp = require('sharp');
const User = require('../Models/userModel');
const catchAsync = require('../Utilities/catchAsync');
const AppError = require('../Utilities/appError');
const factory = require('./handlerFactory');
// const APIFeatures = require('../Utilities/apiFeatures');

// ANCHOR -- Multer Setup --
// don't forget to require multer above

// 1.A) Create the Multer Storage
// const multerStorage = multer.diskStorage({
//   destination: (req, file, callback) => {
//     callback(null, 'public/img/users');
//   },
//   filename: (req, file, callback) => {
//     // Syntax:  user-[id]-[timeStamp].[fileExtension]
//     // Example: user-7549813471-3812401578.jpeg
//     const extension = file.mimetype.split('/')[1];
//     callback(null, `user-${req.user.id}-${Date.now()}.${extension}`);
//   },
// });

// 1.B) this method stores the files as a buffer, which we can access using the 'sharp' package below
const multerStorage = multer.memoryStorage();

// 2) Create the Multer Filter
const multerFilter = (req, file, callback) => {
  if (file.mimetype.startsWith('image')) {
    callback(null, true);
  } else {
    callback(
      new AppError('Not an image! Please upload an image file only.', 400),
      false
    );
  }
};

// 3) Initialize multer using the 'multerStorage' object and the 'multerFilter' function that we intitialized above
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// SECTION == Middle-Ware==

// ANCHOR -- Multer --
exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  // continue to the next middleware if there is no photo
  if (!req.file) return next();

  // define the req.file.filename, which we need in the 'updateMe' function
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  // when doing image processing right after uploading a file, its always best to not even save the file to the disk,
  // but to save it to memory
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

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
  // console.log(req.file);
  // console.log(req.body);
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

  // 2.a) add the new image if one exists
  if (req.file) {
    filteredBody.photo = req.file.filename;
  }

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
