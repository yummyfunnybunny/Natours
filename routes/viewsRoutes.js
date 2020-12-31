// ANCHOR -- Require Modules --
const express = require('express');
const viewsController = require('../controllers/viewsController');

// ANCHOR -- Initialize View Router --
const router = express.Router();

// ANCHOR -- View Routes --
router.get('/', viewsController.getOverview);
// router.get('/tour', viewsController.getTour);
router.get('/tour/:slug', viewsController.getTour);

// ANCHOR -- Export Router --
module.exports = router;
