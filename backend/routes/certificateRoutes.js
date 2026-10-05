const express =
    require("express");

const router =
    express.Router();

const protect =
    require(
        "../middleware/authMiddleware"
    );

const authorize =
    require(
        "../middleware/roleMiddleware"
    );

const {
    generateCertificates,
    getMyCertificates,
    downloadCertificate
} = require(
    "../controllers/certificateController"
);


// Admin
router.post(
    "/generate/:hackathonId",
    protect,
    authorize("admin"),
    generateCertificates
);


// User
router.get(
    "/my",
    protect,
    authorize(
        "participant",
        "mentor",
        "judge",
        "admin"
    ),
    getMyCertificates
);


// User/admin
router.get(
    "/download/:id",
    protect,
    authorize(
        "participant",
        "mentor",
        "judge",
        "admin"
    ),
    downloadCertificate
);


module.exports =
    router;