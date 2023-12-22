const express = require('express');
const uploadController = require('../controllers/uploadController');
const processController = require('../controllers/processController');
const { upload } = require('../utils/uploadFile');
const { auth } = require('../middlewares/auth');

const router = express.Router();
router.post("/upload",auth , upload.single("file"), uploadController.handler);
router.post("/process", auth,processController.handler);

module.exports = router;
