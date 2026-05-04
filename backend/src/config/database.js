// conexao com o mongodb via mangoose
const mangoose = require('mongoose');
const { default: mongoose } = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);

        console.log(`MongoDB conectado: ${conn.connection.host}`);
    } catch (error) {
        console.error('Falha ao conectar o MongoDB:', error.message);
        //encerra o processo sem banco a aplicação nao funciona
        process.exit(1);
    }
};

module.exports = connectDB;
