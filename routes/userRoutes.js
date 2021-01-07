// ANCHOR -- Require Modules --
const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

// ANCHOR -- Initialize Router --
const router = express.Router();

// ANCHOR -- Routes --
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// ANCHOR -- Protect Routes --
// this acts as middleware that will run before any of the below routes
// all routes below this protect middleware is protected
router.use(authController.protect);

router.patch('/updatePassword', authController.updatePassword);
router.get('/Me', userController.getMe, userController.getUser);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

// ANCHOR -- Restrict Routes --
// this middleware will restrict all the below routes to admin usage only
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

// ANCHOR -- Export The User Routers --
module.exports = router;
