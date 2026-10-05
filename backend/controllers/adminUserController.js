const User = require("../models/User");

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select("-password")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        console.error("Get All Users Error:", error);

        res.status(500).json({
            success: false,
            message: "Error fetching users",
            error: error.message
        });
    }
};

// Get single user
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error("Get User Error:", error);

        res.status(500).json({
            success: false,
            message: "Error fetching user",
            error: error.message
        });
    }
};

// Update user role
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        const allowedRoles = [
            "participant",
            "mentor",
            "judge",
            "admin"
        ];

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role"
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.role = role;

        await user.save();

        res.status(200).json({
            success: true,
            message: "User role updated successfully",
            user
        });
    } catch (error) {
        console.error("Update User Role Error:", error);

        res.status(500).json({
            success: false,
            message: "Error updating user role",
            error: error.message
        });
    }
};

// Delete user
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Prevent admin from deleting themselves
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: "You cannot delete your own account"
            });
        }

        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        console.error("Delete User Error:", error);

        res.status(500).json({
            success: false,
            message: "Error deleting user",
            error: error.message
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUserRole,
    deleteUser
};