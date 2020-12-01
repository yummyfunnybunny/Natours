// REQUIRE MODULES
// -------------------------------------
const express = require('express');
const userController = require('./../controllers/userController');
const router = express.Router();

// ROUTE HANDLER FUNCTIONS
// ------------------------------------

// ROUTES
// -------------------------------------
router
.route('/')
.get(userController.getAllUsers)
.post(userController.createUser);

router
.route('/:id')
.get(userController.getUser)
.patch(userController.updateUser)
.delete(userController.deleteUser);

// EXPORT
// -----------------------------------------
module.exports = router;