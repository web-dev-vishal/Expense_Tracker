// const mongoose = require("mongoose");

// const connectDB = async () => {
//     try {
//         await mongoose.connect(process.env.DATABASE_URL, {});
//         console.log('MongoDB connected successfully');
//     } catch (err) {
//         console.error('Error connection to MongoDB', err);
//         process.emit(1);
//     }
// }

// module.exports = connectDB;

const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoURI = process.env.DATABASE_URL;
        
        if (!mongoURI) {
            throw new Error('DATABASE_URL is not defined in .env file');
        }
        
        await mongoose.connect(mongoURI);

        console.log('✅ MongoDB Connected Successfully');
        console.log(`📦 Database: ${mongoose.connection.name}`);
        console.log(`🔗 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
        
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        process.exit(1);
    }
};

mongoose.connection.on('connected', () => {
    console.log('🟢 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('🔴 Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('🟡 Mongoose disconnected from MongoDB');
});

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('⚠️ MongoDB connection closed due to app termination');
    process.exit(0);
});

module.exports = connectDB;