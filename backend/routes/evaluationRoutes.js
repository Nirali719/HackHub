const express = require("express");

const {
  createEvaluation,
  getEvaluations,
  getEvaluationById,
  updateEvaluation,
  deleteEvaluation,
} = require("../controllers/evaluationController");

const router = express.Router();

router.post("/", createEvaluation);

router.get("/", getEvaluations);

router.get("/:id", getEvaluationById);

router.put("/:id", updateEvaluation);

router.delete("/:id", deleteEvaluation);

module.exports = router;