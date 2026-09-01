const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  createResult,
  getResults,
  getResultById,
  getResultsByHackathon,
  updateResult,
  deleteResult,
  generateResults,
} = require("../controllers/resultController");


// CREATE RESULT
router.post(
  "/",
  protect,
  authorize("admin"),
  createResult
);


// GET ALL RESULTS
router.get(
  "/",
  protect,
  authorize("participant", "mentor", "judge", "admin"),
  getResults
);


// GENERATE RESULTS
router.post(
  "/generate/:hackathonId",
  protect,
  authorize("admin"),
  generateResults
);


// GET RESULTS BY HACKATHON
router.get(
  "/hackathon/:hackathonId",
  protect,
  authorize("participant", "mentor", "judge", "admin"),
  getResultsByHackathon
);


// GET RESULT BY ID
router.get(
  "/:id",
  protect,
  authorize("participant", "mentor", "judge", "admin"),
  getResultById
);


// UPDATE RESULT
router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateResult
);


// DELETE RESULT
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteResult
);


module.exports = router;