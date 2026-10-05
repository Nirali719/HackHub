const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");


// ==========================================
// UPLOAD DIRECTORY
// ==========================================

const uploadDirectory = path.join(
    __dirname,
    "..",
    "uploads",
    "submissions"
);

if (!fs.existsSync(uploadDirectory)) {

    fs.mkdirSync(
        uploadDirectory,
        {
            recursive: true
        }
    );
}


// ==========================================
// MAX PDF SIZE
// DEFAULT = 5 MB
// ==========================================

const maxSizeMB =
    Number(
        process.env.MAX_SUBMISSION_PDF_MB || 5
    );

const maxSizeBytes =
    maxSizeMB * 1024 * 1024;


// ==========================================
// STORAGE
// ==========================================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(
            null,
            uploadDirectory
        );
    },

    filename: (req, file, cb) => {

        const uniqueName =
            `${Date.now()}-${crypto
                .randomBytes(6)
                .toString("hex")}${path.extname(
                file.originalname
            ).toLowerCase()}`;

        cb(
            null,
            uniqueName
        );
    }
});


// ==========================================
// PDF FILTER
// ==========================================

const fileFilter = (
    req,
    file,
    cb
) => {

    const extension =
        path.extname(
            file.originalname
        ).toLowerCase();

    if (
        file.mimetype !==
            "application/pdf" ||
        extension !== ".pdf"
    ) {

        return cb(
            new Error(
                "Only PDF files are allowed."
            )
        );
    }

    cb(null, true);
};


// ==========================================
// MULTER
// ==========================================

const uploadSubmissionPdf =
    multer({

        storage,

        limits: {
            fileSize:
                maxSizeBytes
        },

        fileFilter

    });


module.exports = {
    uploadSubmissionPdf,
    uploadDirectory,
    maxSizeMB
};