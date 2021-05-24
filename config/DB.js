const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config();

const connectDB = async () => {
    try {
        mongoose.connect(process.env.DB, {
            useNewUrlParser: true,  
            //useUnifiedTopology: true, 
            useCreateIndex: true,
            useFindAndModify: false
        });
        await console.log(`Base de datos conectada`);
    } catch (error) {
        console.log(`Error en conexión a base de datos: ${error}`);
        process.exit();
    }  
}

module.exports = connectDB;