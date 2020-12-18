// ANCHOR -- Require Modules --
const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

// ANCHOR -- Initialize Router --
const router = express.Router();

// ANCHOR -- Route --
router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch(
  '/updatePassword',
  authController.protect,
  authController.updatePassword
);

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
