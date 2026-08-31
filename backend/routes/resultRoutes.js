const express = require("express");

const {
  createResult,
  getResults,
  getResultById,
  getResultsByHackathon,
  updateResult,
  deleteResult,
  generateResults,
} = require("../controllers/resultController");

const router = express.Router();

router.post("/", createResult);

router.get("/", getResults);

router.get(
  "/hackathon/:hackathonId",
  getResultsByHackathon
);

router.get("/:id", getResultById);

router.put("/:id", updateResult);

router.delete("/:id", deleteResult);

router.post(
  "/generate/:hackathonId",
  generateResults
);

module.exports = router;