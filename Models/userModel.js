// ANCHOR -- Require Modules --
const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// ANCHOR -- Create The User Schema --
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
    photo: {
      type: String,
      default: 'default.jpg',
    },
    role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user',
    },
    password: {
      type: String,
      required: [true, 'User must create a valid password'],
      minlength: 8,
      select: false, // stops this field from being projected to the client
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
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    // Schema Options
    toJSON: { virtuals: true }, // this tells the schema to include virtual properties when outputted to JSON
    toObject: { virtuals: true }, // this tells the schema to include virtual properties when outputted to objects
  }
);

// SECTION == Create Indexes ==
// !SECTION

// SECTION == Virtual Properties ==
// !SECTION

// SECTION == Document Middle-Ware ==

// ANCHOR --  Password Hashing --
userSchema.pre('save', async function (next) {
  // only run this middleware if a password has been created or updated
  if (!this.isModified('password')) {
    return next();
  }
  // Hash the password using bCrypt
  this.password = await bcrypt.hash(this.password, 12);

  // this line basically deletes the passwordConfirm field, since we only needed it at the very begining
  this.passwordConfirm = undefined;

  // proceed to next middleware
  next();
});

// ANCHOR --  Set PasswordChangedAt --
userSchema.pre('save', function (next) {
  // check if the password was modified or just created
  if (!this.isModified('password') || this.isNew) {
    return next();
  }
  // set the timeStamp
  this.passwordChangedAt = Date.now() - 1000;

  // proceed to next middleware
  next();
});

// !SECTION

// SECTION == Query Middle-Ware ==

// ANCHOR -- Remove Inactive Users From Query --
// /^find/ - we use a regular expression here to include any function with the word 'find' in it
// this will now run for find, findById, findByIdAndUpdate, etc.
userSchema.pre(/^find/, function (next) {
  // 'this' points to the current query object
  this.find({ active: { $ne: false } });
  next();
});

// !SECTION

// SECTION == Aggregation Middle-Ware ==
// !SECTION

// SECTION == Instance Methods ==

// ANCHOR -- Correct Password --
// -- used by: authController.login, authController.updatePassword
// we will use bcrypt here to compare the input password from a user trying to login with the hashed password in the DB
userSchema.methods.correctPassword = async function (
  inputPassword,
  hashedPassword
) {
  return await bcrypt.compare(inputPassword, hashedPassword);
};

// ANCHOR -- Changed Password After --
// -- used by: authController.protect
// this function checks if the user has ever changed their password after initial creation
userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    // 'this' points to the current document
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    //console.log(this.passwordChangedAt, JWTTimeStamp);
    return JWTTimeStamp < changedTimeStamp;
  }
  // false means password was never changed
  return false;
};

// ANCHOR -- Create Password Reset Token --
// -- used by: authController.forgotPassword
userSchema.methods.createPasswordResetToken = function () {
  // create a random token number, 32 characters long, saved as a hexadecimal
  const resetToken = crypto.randomBytes(32).toString('hex');

  // hash the resetToken using 'sha256 encryption algorithm', saved as a hexadecimal
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  //console.log({ resetToken }, this.passwordResetToken);

  // set the expiration of the password reset token to 10 minutes (converting from miliseconds)
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // return the reset token
  return resetToken;
};

// !SECTION

// ANCHOR -- Create The User Model --
const User = mongoose.model('User', userSchema);

// ANCHOR -- Export The User Model --
module.exports = User;
