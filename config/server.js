const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
//const fileUpload = require('express-fileupload');
const connectDB = require('./DB.js');

// Variables de entorno
dotenv.config();
const PORT = process.env.PORT || 5000;

// Conexión a base de datos
connectDB();

// Configuración del servidor
const app = express();
let server = http.createServer(app);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
/*app.use(fileUpload({
	createParentPath: true
}));*/

app.get('/', (req, res) => res.send('HEDERA TESTNET'));

// Rutas sistema administrador
app.use('/hedera', require('../routes/hedera'));

// Iniciando servidor
server.listen(PORT, function () {
	console.log(`Server running on port ${PORT}`);
});