const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  createSubmission,
  getSubmissions,
  getSubmissionById,
  updateSubmission,
  deleteSubmission,
  submitSubmission
} = require("../controllers/submissionController");


// ==========================================
// CREATE SUBMISSION
// PARTICIPANT
// Controller checks Team Leader
// ==========================================

router.post(
  "/",
  protect,
  authorize("participant"),
  createSubmission
);


// ==========================================
// GET ALL SUBMISSIONS
// ALL PROJECT ROLES
// ==========================================

router.get(
  "/",
  protect,
  authorize("participant", "mentor", "judge", "admin"),
  getSubmissions
);


// ==========================================
// GET SINGLE SUBMISSION
// ALL PROJECT ROLES
// ==========================================

router.get(
  "/:id",
  protect,
  authorize("participant", "mentor", "judge", "admin"),
  getSubmissionById
);


// ==========================================
// UPDATE SUBMISSION
// PARTICIPANT OR ADMIN
// Controller checks Team Leader
// ==========================================

router.put(
  "/:id",
  protect,
  authorize("participant", "admin"),
  updateSubmission
);


// ==========================================
// DELETE SUBMISSION
// PARTICIPANT OR ADMIN
// Controller checks Team Leader
// ==========================================

router.delete(
  "/:id",
  protect,
  authorize("participant", "admin"),
  deleteSubmission
);


// ==========================================
// SUBMIT PROJECT
// PARTICIPANT ONLY
// Controller checks Team Leader
// ==========================================

router.patch(
  "/:id/submit",
  protect,
  authorize("participant"),
  submitSubmission
);


module.exports = router;