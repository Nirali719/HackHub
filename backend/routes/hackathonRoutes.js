const express = require("express");

const {
  createHackathon,
  getHackathons,
  getHackathonById,
  updateHackathon,
  deleteHackathon,
} = require("../controllers/hackathonController");

const router = express.Router();

router.post("/", createHackathon);
router.get("/", getHackathons);
router.get("/:id", getHackathonById);
router.put("/:id", updateHackathon);
router.delete("/:id", deleteHackathon);

module.exports = router;