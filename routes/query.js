const express = require('express');
const queryController = require('../controllers/queryController');  // Update the path
const { auth } = require('../middlewares/auth');
const router = express.Router();


// process the query coming from the user
router.post('/query-process', auth,queryController.handler);


module.exports = router;