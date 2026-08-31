const express = require("express");

const {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
} = require("../controllers/teamController");

const router = express.Router();

// Team CRUD
router.post("/", createTeam);
router.get("/", getTeams);
router.get("/:id", getTeamById);
router.put("/:id", updateTeam);
router.delete("/:id", deleteTeam);

// Team members
router.post("/:id/members", addTeamMember);
router.delete("/:id/members/:userId", removeTeamMember);

module.exports = router;