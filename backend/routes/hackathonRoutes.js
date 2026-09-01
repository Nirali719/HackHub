const express = require("express");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  createHackathon,
  getHackathons,
  getHackathonById,
  updateHackathon,
  deleteHackathon,
} = require("../controllers/hackathonController");

const router = express.Router();

router.post("/",protect,authorize("admin"),createHackathon);
router.get("/", getHackathons);
router.get("/:id", getHackathonById);
router.put("/:id",protect,authorize("admin"),updateHackathon);
router.delete("/:id",protect,authorize("admin"),deleteHackathon);

module.exports = router;