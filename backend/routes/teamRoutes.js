const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember
} = require("../controllers/teamController");


// ==========================================
// CREATE TEAM
// PARTICIPANT ONLY
// ==========================================

router.post(
  "/",
  protect,
  authorize("participant"),
  createTeam
);


// ==========================================
// GET ALL TEAMS
// PARTICIPANT AND ADMIN
// ==========================================

router.get(
  "/",
  protect,
  authorize("participant", "admin"),
  getTeams
);


// ==========================================
// GET SINGLE TEAM
// PARTICIPANT AND ADMIN
// ==========================================

router.get(
  "/:id",
  protect,
  authorize("participant", "admin"),
  getTeamById
);


// ==========================================
// UPDATE TEAM
// PARTICIPANT OR ADMIN
// Controller checks Team Leader
// ==========================================

router.put(
  "/:id",
  protect,
  authorize("participant", "admin"),
  updateTeam
);


// ==========================================
// DELETE TEAM
// PARTICIPANT OR ADMIN
// Controller checks Team Leader
// ==========================================

router.delete(
  "/:id",
  protect,
  authorize("participant", "admin"),
  deleteTeam
);


// ==========================================
// ADD TEAM MEMBER
// PARTICIPANT OR ADMIN
// Controller checks Team Leader
// ==========================================

router.post(
  "/:id/members",
  protect,
  authorize("participant", "admin"),
  addTeamMember
);


// ==========================================
// REMOVE TEAM MEMBER
// PARTICIPANT OR ADMIN
// Controller checks Team Leader
// ==========================================

router.delete(
  "/:id/members/:userId",
  protect,
  authorize("participant", "admin"),
  removeTeamMember
);


module.exports = router;