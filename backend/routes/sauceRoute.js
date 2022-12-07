const express = require('express');
const router = express.Router();

//Middleware
const auth = require('../middleware/authToken');
const multer = require('../middleware/multerConfig');

//Controller location
const sauceController = require('../controllers/sauceController');

//Functions
router.get('/', auth, sauceController.getAllSauces);
router.post('/', auth, multer, sauceController.createSauce);
router.get('/:id', auth, sauceController.getOneSauce);
router.put('/:id', auth, multer, sauceController.modifySauce);
router.delete('/:id', auth, sauceController.deleteSauce)

module.exports = router;