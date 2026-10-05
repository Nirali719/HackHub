const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  addGuidance,
  getGuidance
} = require("../controllers/mentorGuidanceController");


// Mentor sends guidance
router.post(
  "/:id/guidance",
  protect,
  authorize("mentor"),
  addGuidance
);


// Mentor/Participant views guidance
router.get(
  "/:id/guidance",
  protect,
  getGuidance
);


module.exports = router;
