const express = require('express');
const router = express.Router();
const hederaController = require('../controllers/hedera');

router.get('/usuarios', hederaController.getUsuarios);
//router.post('/detalles', hederaController.detalles);
router.post('/nuevo-usuario', hederaController.addUsuario);


module.exports = router;