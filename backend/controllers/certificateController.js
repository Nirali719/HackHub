const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PDFDocument =
    require("pdfkit");

const Certificate =
    require("../models/Certificate");

const Hackathon =
    require("../models/Hackathon");

const Result =
    require("../models/Result");

const Registration =
    require("../models/Registration");

const Team =
    require("../models/Team");


const certificateDirectory =
    path.join(
        __dirname,
        "..",
        "certificates"
    );


if (
    !fs.existsSync(
        certificateDirectory
    )
) {

    fs.mkdirSync(
        certificateDirectory,
        {
            recursive: true
        }
    );
}


// ==========================================
// GENERATE CERTIFICATES
// ==========================================

const generateCertificates =
    async (req, res) => {

        try {

            const {
                hackathonId
            } = req.params;


            const hackathon =
                await Hackathon.findById(
                    hackathonId
                );


            if (!hackathon) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Hackathon not found"
                });
            }


            const results =
                await Result.find({
                    hackathon:
                        hackathonId
                });


            if (
                results.length === 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "No results found"
                });
            }


            const unpublished =
                results.some(
                    (result) =>
                        !result.published
                );


            if (unpublished) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Results must be published before certificates can be generated"
                });
            }


            const registrations =
                await Registration.find({
                    hackathon:
                        hackathonId,

                    status: {
                        $ne: "cancelled"
                    }
                }).populate(
                    "participant",
                    "name email"
                );


            let generatedCount = 0;


            // ======================================
            // PARTICIPATION CERTIFICATES
            // ======================================

            for (
                const registration
                of registrations
            ) {

                const user =
                    registration.participant;


                if (!user) {
                    continue;
                }


                const existing =
                    await Certificate.findOne({

                        user:
                            user._id,

                        hackathon:
                            hackathonId,

                        type:
                            "participation"
                    });


                if (existing) {
                    continue;
                }


                const certificateNumber =
                    `PART-${Date.now()}-${crypto
                        .randomBytes(4)
                        .toString("hex")
                        .toUpperCase()}`;


                const fileName =
                    `${certificateNumber}.pdf`;


                const filePath =
                    path.join(
                        certificateDirectory,
                        fileName
                    );


                await createCertificatePDF({

                    filePath,

                    certificateNumber,

                    participantName:
                        user.name,

                    hackathonTitle:
                        hackathon.title,

                    type:
                        "participation"
                });


                await Certificate.create({

                    certificateNumber,

                    user:
                        user._id,

                    hackathon:
                        hackathonId,

                    type:
                        "participation",

                    fileName
                });


                generatedCount++;
            }


            // ======================================
            // WINNER CERTIFICATES
            // ======================================

            const winnerResults =
                results.filter(
                    (result) =>
                        result.resultStatus ===
                        "winner"
                );


            for (
                const winnerResult
                of winnerResults
            ) {

                const team =
                    await Team.findById(
                        winnerResult.teamId
                    ).populate(
                        "members",
                        "name email"
                    );


                if (!team) {
                    continue;
                }


                for (
                    const member
                    of team.members
                ) {

                    const existing =
                        await Certificate.findOne({

                            user:
                                member._id,

                            hackathon:
                                hackathonId,

                            type:
                                "winner"
                        });


                    if (existing) {
                        continue;
                    }


                    const certificateNumber =
                        `WIN-${Date.now()}-${crypto
                            .randomBytes(4)
                            .toString("hex")
                            .toUpperCase()}`;


                    const fileName =
                        `${certificateNumber}.pdf`;


                    const filePath =
                        path.join(
                            certificateDirectory,
                            fileName
                        );


                    await createCertificatePDF({

                        filePath,

                        certificateNumber,

                        participantName:
                            member.name,

                        hackathonTitle:
                            hackathon.title,

                        type:
                            "winner"
                    });


                    await Certificate.create({

                        certificateNumber,

                        user:
                            member._id,

                        hackathon:
                            hackathonId,

                        result:
                            winnerResult._id,

                        type:
                            "winner",

                        fileName
                    });


                    generatedCount++;
                }
            }


            res.status(201).json({

                success: true,

                message:
                    "Certificates generated successfully",

                count:
                    generatedCount
            });


        } catch (error) {

            console.error(
                "Generate Certificate Error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Error generating certificates",

                error:
                    error.message
            });
        }
    };


// ==========================================
// GET MY CERTIFICATES
// ==========================================

const getMyCertificates =
    async (req, res) => {

        try {

            const certificates =
                await Certificate.find({
                    user:
                        req.user._id
                })
                    .populate(
                        "hackathon",
                        "title status"
                    )
                    .sort({
                        generatedAt: -1
                    });


            res.status(200).json({

                success: true,

                count:
                    certificates.length,

                certificates
            });


        } catch (error) {

            res.status(500).json({

                success: false,

                message:
                    "Error fetching certificates",

                error:
                    error.message
            });
        }
    };


// ==========================================
// DOWNLOAD
// ==========================================

const downloadCertificate =
    async (req, res) => {

        try {

            const certificate =
                await Certificate.findById(
                    req.params.id
                );


            if (!certificate) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Certificate not found"
                });
            }


            if (
                req.user.role !== "admin" &&
                certificate.user.toString() !==
                    req.user._id.toString()
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "You are not authorized to download this certificate"
                });
            }


            const filePath =
                path.join(
                    certificateDirectory,
                    certificate.fileName
                );


            if (
                !fs.existsSync(
                    filePath
                )
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Certificate file not found"
                });
            }


            res.download(
                filePath,
                certificate.fileName
            );


        } catch (error) {

            res.status(500).json({

                success: false,

                message:
                    "Error downloading certificate",

                error:
                    error.message
            });
        }
    };


// ==========================================
// PDF CREATOR
// ==========================================

const createCertificatePDF =
    ({
        filePath,
        certificateNumber,
        participantName,
        hackathonTitle,
        type
    }) => {

        return new Promise(
            (
                resolve,
                reject
            ) => {

                const doc =
                    new PDFDocument({

                        size: "A4",

                        layout:
                            "landscape",

                        margin: 50
                    });


                const stream =
                    fs.createWriteStream(
                        filePath
                    );


                doc.pipe(stream);


                doc
                    .fontSize(34)
                    .font(
                        "Helvetica-Bold"
                    )
                    .text(
                        "HACKFORGE",
                        {
                            align:
                                "center"
                        }
                    );


                doc.moveDown(1);


                doc
                    .fontSize(27)
                    .text(

                        type === "winner"
                            ? "WINNER CERTIFICATE"
                            : "CERTIFICATE OF PARTICIPATION",

                        {
                            align:
                                "center"
                        }
                    );


                doc.moveDown(1.5);


                doc
                    .fontSize(18)
                    .font("Helvetica")
                    .text(
                        "This certificate is proudly presented to",
                        {
                            align:
                                "center"
                        }
                    );


                doc.moveDown(0.7);


                doc
                    .fontSize(30)
                    .font(
                        "Helvetica-Bold"
                    )
                    .text(
                        participantName,
                        {
                            align:
                                "center"
                        }
                    );


                doc.moveDown(1);


                doc
                    .fontSize(18)
                    .font("Helvetica")
                    .text(

                        type === "winner"
                            ? "for winning the hackathon"
                            : "for successfully participating in",

                        {
                            align:
                                "center"
                        }
                    );


                doc.moveDown(0.5);


                doc
                    .fontSize(24)
                    .font(
                        "Helvetica-Bold"
                    )
                    .text(
                        hackathonTitle,
                        {
                            align:
                                "center"
                        }
                    );


                doc.moveDown(2);


                doc
                    .fontSize(12)
                    .font("Helvetica")
                    .text(
                        `Certificate ID: ${certificateNumber}`,
                        {
                            align:
                                "center"
                        }
                    );


                doc.moveDown(1);


                doc
                    .fontSize(12)
                    .text(
                        `Issued by HackForge`,
                        {
                            align:
                                "center"
                        }
                    );


                doc.end();


                stream.on(
                    "finish",
                    resolve
                );

                stream.on(
                    "error",
                    reject
                );
            }
        );
    };


module.exports = {

    generateCertificates,

    getMyCertificates,

    downloadCertificate
};