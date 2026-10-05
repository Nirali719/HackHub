const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  createEvaluation,
  getEvaluations,
  getEvaluationById,
  updateEvaluation,
  deleteEvaluation,
  getEvaluationsBySubmission
  
} = require("../controllers/evaluationController");


// ==========================================
// CREATE EVALUATION
// JUDGE ONLY
// ==========================================

router.post(
  "/",
  protect,
  authorize("judge"),
  createEvaluation
);


// ==========================================
// GET EVALUATIONS
// JUDGE → OWN
// ADMIN → ALL
// ==========================================

router.get(
  "/",
  protect,
  authorize("judge", "admin"),
  getEvaluations
);

// ==========================================
// GET EVALUATIONS BY SUBMISSION
// PARTICIPANT → THEIR TEAM
// MENTOR → ASSIGNED TEAM
// JUDGE → ANY
// ADMIN → ANY
// ==========================================

router.get(
    "/submission/:submissionId",
    protect,
    authorize("participant", "mentor", "judge", "admin"),
    getEvaluationsBySubmission
);

// ==========================================
// GET SINGLE EVALUATION
// JUDGE → OWN
// ADMIN → ANY
// ==========================================

router.get(
  "/:id",
  protect,
  authorize("judge", "admin"),
  getEvaluationById
);


// ==========================================
// UPDATE EVALUATION
// JUDGE → OWN
// ADMIN → ANY
// ==========================================

router.put(
  "/:id",
  protect,
  authorize("judge", "admin"),
  updateEvaluation
);


// ==========================================
// DELETE EVALUATION
// JUDGE → OWN
// ADMIN → ANY
// ==========================================

router.delete(
  "/:id",
  protect,
  authorize("judge", "admin"),
  deleteEvaluation
);


module.exports = router;