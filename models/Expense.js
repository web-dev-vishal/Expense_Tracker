// const mongoose = require("mongoose");

// const ExpenseSchema = new mongoose.Schema({
//     userId: { 
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//         required: true
//     },
//     icon: {
//         type: String
//     },
//     categroy: {
//         type: String, //Example: Food, Rent, Groceries
//         required: true
//     },
//     amount: {
//         type: Number,
//         required: true
//     },
//     date: {
//         type: Date,
//         default: Date.now
//     }
// }, {timestamps: true});


// module.exports = mongoose.model("Expense", ExpenseSchema);

const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true  // Add index for faster queries
    },
    icon: {
        type: String,
        default: "💰"  //  default icon
    },
    category: {
        type: String, //Example: Food, Rent, Groceries
        required: true,
        trim: true  // Remove whitespace
    },
    amount: {
        type: Number,
        required: true,
        min: [0, "Amount cannot be negative"]  // Validation
    },
    date: {
        type: Date,
        default: Date.now
    },
    description: {  // helpful for tracking details
        type: String,
        trim: true
    }
}, {timestamps: true});

// Compound index for common queries
ExpenseSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model("Expense", ExpenseSchema);