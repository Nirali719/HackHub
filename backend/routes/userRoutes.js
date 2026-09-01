const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const User = require("../models/User");
const {
    registerUser,
    loginUser,
    getMyProfile,
    updateMyProfile,
    getAllUsers,
    deleteUser
  } = require("../controllers/userController");
  
// Register a new user
router.post("/register", registerUser);
router.post("/login", loginUser);


// ==========================================
// GET MY PROFILE
// GET /users/profile
// ALL LOGGED-IN USERS
// ==========================================

router.get(
    "/profile",
    protect,
    getMyProfile
  );
  
  
  // ==========================================
  // UPDATE MY PROFILE
  // PUT /users/profile
  // ALL LOGGED-IN USERS
  // ==========================================
  
  router.put(
    "/profile",
    protect,
    updateMyProfile
  );
  
  
  // ==========================================
  // GET ALL USERS
  // GET /users
  // ADMIN ONLY
  // ==========================================
  
  router.get(
    "/",
    protect,
    authorize("admin"),
    getAllUsers
  );
  
  
  // ==========================================
  // DELETE USER
  // DELETE /users/:id
  // ADMIN ONLY
  // ==========================================
  
  router.delete(
    "/:id",
    protect,
    authorize("admin"),
    deleteUser
  );
  
  

module.exports = router;