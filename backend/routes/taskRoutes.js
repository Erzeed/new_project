const express = require('express');
const taskController = require('../controllers/isparkControllers/taskController');

const router = express.Router();

router.post('/callback', taskController.callback);

module.exports = router;