// ANCHOR -- Require Modules --
const express = require('express');
const viewsController = require('../controllers/viewsController');
// const authController = require('../controllers/authController');

// ANCHOR -- Initialize View Router --
const router = express.Router();

// ANCHOR -- View Routes --
router.get('/', viewsController.getOverview);
// router.get('/tour', viewsController.getTour);
router.get('/tour/:slug', viewsController.getTour);
router.get('/login', viewsController.getLoginForm);

// ANCHOR -- Export Router --
module.exports = router;
