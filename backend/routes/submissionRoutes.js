const express = require("express");

const router = express.Router();

const protect =
    require("../middleware/authMiddleware");

const authorize =
    require("../middleware/roleMiddleware");

const {
    uploadSubmissionPdf
} = require(
    "../middleware/uploadMiddleware"
);

const {
    createSubmission,
    getSubmissions,
    getSubmissionById,
    getSubmissionByTeam,
    updateSubmission,
    deleteSubmission,
    submitSubmission,
    downloadSubmissionPdf
} = require(
    "../controllers/submissionController"
);


// ==========================================
// CREATE
// ==========================================

router.post(
    "/",
    protect,
    authorize("participant"),
    uploadSubmissionPdf.single(
        "submissionPdf"
    ),
    createSubmission
);


// ==========================================
// GET ALL
// ==========================================

router.get(
    "/",
    protect,
    authorize(
        "participant",
        "mentor",
        "judge",
        "admin"
    ),
    getSubmissions
);


// ==========================================
// GET BY TEAM
// IMPORTANT: BEFORE /:id
// ==========================================

router.get(
    "/team/:teamId",
    protect,
    authorize(
        "participant",
        "mentor",
        "judge",
        "admin"
    ),
    getSubmissionByTeam
);


// ==========================================
// DOWNLOAD PDF
// ==========================================

router.get(
    "/:id/pdf",
    protect,
    authorize(
        "participant",
        "mentor",
        "judge",
        "admin"
    ),
    downloadSubmissionPdf
);


// ==========================================
// GET SINGLE
// ==========================================

router.get(
    "/:id",
    protect,
    authorize(
        "participant",
        "mentor",
        "judge",
        "admin"
    ),
    getSubmissionById
);


// ==========================================
// UPDATE
// ==========================================

router.put(
    "/:id",
    protect,
    authorize(
        "participant",
        "admin"
    ),
    uploadSubmissionPdf.single(
        "submissionPdf"
    ),
    updateSubmission
);


// ==========================================
// DELETE
// ==========================================

router.delete(
    "/:id",
    protect,
    authorize(
        "participant",
        "admin"
    ),
    deleteSubmission
);


// ==========================================
// FINAL SUBMIT
// ==========================================

router.patch(
    "/:id/submit",
    protect,
    authorize("participant"),
    submitSubmission
);


module.exports = router;