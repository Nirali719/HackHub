const express = require("express");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const {
  createRegistration,
  getRegistrations,
  getRegistrationById,
  updateRegistration,
  deleteRegistration,
} = require("../controllers/registrationController");

const router = express.Router();

router.post("/",protect,authorize("participant"), createRegistration);
router.get("/",protect,authorize("participant","admin"),getRegistrations);
router.get("/:id",protect, authorize("participant", "admin"),getRegistrationById);
router.put("/:id",protect,authorize("admin"), updateRegistration);
router.delete("/:id",protect,authorize("participant","admin"), deleteRegistration);

module.exports = router;