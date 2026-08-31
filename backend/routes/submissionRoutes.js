const express = require("express");

const {
  createSubmission,
  getSubmissions,
  getSubmissionById,
  updateSubmission,
  deleteSubmission,
  submitSubmission,
} = require("../controllers/submissionController");

const router = express.Router();

router.post("/", createSubmission);

router.get("/", getSubmissions);

router.get("/:id", getSubmissionById);

router.put("/:id", updateSubmission);

router.delete("/:id", deleteSubmission);

router.patch("/:id/submit", submitSubmission);

module.exports = router;