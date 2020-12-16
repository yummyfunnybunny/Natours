// == Require Modules/Packages ==
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// == Create The User Schema ==
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User must have a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'User must provide an Email'],
      unique: true,
      lowercase: true, // this validator will automatically convert the email string to lowercase
      validate: [validator.isEmail, 'User must provide a valid Email'],
    },
    photo: String,
    password: {
      type: String,
      required: [true, 'User must create a valid password'],
      minlength: 8,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'User must confirm password'],
      validate: {
        // this only works on CREATE and SAVE! not UPDATE or DELETE
        validator: function (el) {
          return el === this.password;
        },
        message: 'Passwords are not the same!',
      },
    },
  },
  {
    // Schema Options
    toJSON: { virtuals: true }, // this tells the schema to include virtual properties when outputted to JSON
    toObject: { virtuals: true }, // this tells the schema to include virtual properties when outputted to objects
  }
);

// == MiddleWare ==

// - Password Hashing Middleware -
userSchema.pre('save', async function (next) {
  // only run this middleware if a password has been created or updated
  if (!this.isModified('password')) {
    return next();
  }
  // Hash the password using bCrypt
  this.password = await bcrypt.hash(this.password, 12);

  // this line basically deletes the passwordConfirm field, since we only needed it at the very begining
  this.passwordConfirm = undefined;
  next();
});

// == Create The User Model ==
const User = mongoose.model('User', userSchema);

// == Export The User Model ==
module.exports = User;
