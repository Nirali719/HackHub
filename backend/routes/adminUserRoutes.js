const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
    getAllUsers,
    getUserById,
    updateUserRole,
    deleteUser
} = require("../controllers/adminUserController");

// All routes require admin
router.use(protect);
router.use(authorize("admin"));

// Get all users
router.get("/", getAllUsers);

// Get one user
router.get("/:id", getUserById);

// Update user role
router.put("/:id/role", updateUserRole);

// Delete user
router.delete("/:id", deleteUser);

module.exports = router;