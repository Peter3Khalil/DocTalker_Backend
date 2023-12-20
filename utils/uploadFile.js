const multer = require('multer');

// config multer
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })  // now the file in the buffer memmory

module.exports = { upload }