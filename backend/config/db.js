const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL, {});
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.error('Error connection to MongoDB', err);
        process.emit(1);
    }
}

module.exports = connectDB;