const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
     phone: {
        type: String,
        default: null 
    },
    password: {
        type: String,
        required: true
    },
    profileImageUrl: {
        type: String,
        default: null
    },
}, {timestamps: true});

// Hashing password before saving it
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next;
    }
    
    try {
        this.password = await bcrypt.hash(this.password, 10);
        return next;
    } catch (error) {
        return next(error);
    }
});

// Compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);