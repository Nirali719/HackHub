const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },

        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false
        },

        phone: {
            type: String,
            required: true,
            trim: true
        },

        // profileImage: {
        //     type: String,
        //     default: ""
        // },

        role: {
            type: String,
            enum: ["participant", "admin" , "mentor"],
            required: true,
            default: "participant"
        },

        collegeName: {
            type: String,
            trim: true,
            required: function () {
                return this.role === "participant";
            }
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);

module.exports = User;