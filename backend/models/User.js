const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false
    },

    role: {
      type: String,
      enum: ["participant", "mentor", "judge", "admin"],
      default: "participant"
    },
    college: {
            type: String,
            trim: true,
            required: function () {
                return this.role === "participant";
            }
    },
    phone: {
            type: String,
            required: true,
            trim: true
        }    
  },
  
);
const User = mongoose.model("User", userSchema);

module.exports = User;