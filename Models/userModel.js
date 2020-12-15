// == Require Modules/Packages ==
const mongoose = require('mongoose');
const validator = require('validator');

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
        // this only works on SAVE!
        validator: function (el) {
          return el === this.password;
        },
      },
    },
  },
  {
    // Schema Options
    toJSON: { virtuals: true }, // this tells the schema to include virtual properties when outputted to JSON
    toObject: { virtuals: true }, // this tells the schema to include virtual properties when outputted to objects
  }
);

// == Create The User Model ==
const User = mongoose.model('User', userSchema);

// == Export The User Model ==
module.exports = User;
