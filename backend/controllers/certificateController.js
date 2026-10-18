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
// DOWNLOAD CERTIFICATE
// ==========================================

const downloadCertificate =
    async (req, res) => {

        try {

            // ==========================================
            // FIND CERTIFICATE
            // ==========================================

            const certificate =
                await Certificate.findById(
                    req.params.id
                )
                    .populate(
                        "user",
                        "name email"
                    )
                    .populate(
                        "hackathon",
                        "title"
                    );


            if (!certificate) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Certificate not found"
                });
            }


            // ==========================================
            // AUTHORIZATION
            // ==========================================

            if (
                req.user.role !== "admin" &&
                certificate.user._id.toString() !==
                    req.user._id.toString()
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "You are not authorized to download this certificate"
                });
            }


            // ==========================================
            // VALIDATE REQUIRED DATA
            // ==========================================

            if (
                !certificate.user ||
                !certificate.hackathon
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Certificate information is incomplete"
                });
            }


            // ==========================================
            // FILE PATH
            // ==========================================

            const filePath =
                path.join(
                    certificateDirectory,
                    certificate.fileName
                );


            // ==========================================
            // REGENERATE CERTIFICATE
            //
            // This is important.
            //
            // Every time the participant clicks
            // "Download Certificate", the PDF is
            // generated again using the latest
            // certificate design.
            // ==========================================

            await createCertificatePDF({

                filePath,

                certificateNumber:
                    certificate.certificateNumber,

                participantName:
                    certificate.user.name,

                hackathonTitle:
                    certificate.hackathon.title,

                type:
                    certificate.type
            });


            // ==========================================
            // DOWNLOAD THE NEW PDF
            // ==========================================

            res.download(
                filePath,
                certificate.fileName
            );


        } catch (error) {

            console.error(
                "Certificate Download Error:",
                error
            );


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
const createCertificatePDF = ({
    filePath,
    certificateNumber,
    participantName,
    hackathonTitle,
    type
}) => {

    return new Promise((resolve, reject) => {

        // =====================================================
        // PDF SETUP
        // =====================================================

        const doc = new PDFDocument({
            size: "A4",
            layout: "landscape",
            margin: 0
        });

        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        const W = 841.89;
        const H = 595.28;

        // =====================================================
        // CERTIFICATE TYPE
        // =====================================================

        const isWinner = type === "winner";

        // =====================================================
        // COLORS
        // =====================================================

        const colors = isWinner
            ? {
                primary: "#B8860B",
                secondary: "#D4AF37",
                dark: "#3B2F0B",
                light: "#FFF8DC",
                border: "#C9A227",
                text: "#333333",
                muted: "#6B7280"
            }
            : {
                primary: "#1D4ED8",
                secondary: "#60A5FA",
                dark: "#172554",
                light: "#EFF6FF",
                border: "#3B82F6",
                text: "#333333",
                muted: "#6B7280"
            };

        // =====================================================
        // BACKGROUND
        // =====================================================

        doc
            .rect(0, 0, W, H)
            .fill("#FFFFFF");

        // =====================================================
        // DECORATIVE CORNERS
        // =====================================================

        // Top-left
        doc
            .save()
            .moveTo(0, 0)
            .lineTo(150, 0)
            .lineTo(0, 150)
            .closePath()
            .fill(colors.dark)
            .restore();

        // Top-left accent
        doc
            .save()
            .moveTo(0, 0)
            .lineTo(95, 0)
            .lineTo(0, 95)
            .closePath()
            .fill(colors.secondary)
            .restore();

        // Bottom-right
        doc
            .save()
            .moveTo(W, H)
            .lineTo(W - 150, H)
            .lineTo(W, H - 150)
            .closePath()
            .fill(colors.dark)
            .restore();

        // Bottom-right accent
        doc
            .save()
            .moveTo(W, H)
            .lineTo(W - 95, H)
            .lineTo(W, H - 95)
            .closePath()
            .fill(colors.secondary)
            .restore();

        // =====================================================
        // OUTER BORDER
        // =====================================================

        doc
            .lineWidth(5)
            .strokeColor(colors.dark)
            .rect(24, 24, W - 48, H - 48)
            .stroke();

        // =====================================================
        // INNER BORDER
        // =====================================================

        doc
            .lineWidth(2)
            .strokeColor(colors.border)
            .rect(39, 39, W - 78, H - 78)
            .stroke();

        // =====================================================
        // BRAND
        // =====================================================

        doc
            .font("Helvetica-Bold")
            .fontSize(30)
            .fillColor(colors.dark)
            .text(
                "HACKHUB",
                0,
                58,
                {
                    width: W,
                    align: "center"
                }
            );

        doc
            .font("Helvetica")
            .fontSize(9)
            .fillColor(colors.muted)
            .text(
                "HACKATHON MANAGEMENT PORTAL",
                0,
                94,
                {
                    width: W,
                    align: "center"
                }
            );

        // =====================================================
        // TOP LINE
        // =====================================================

        doc
            .lineWidth(2)
            .strokeColor(colors.primary)
            .moveTo(275, 116)
            .lineTo(566, 116)
            .stroke();

        // =====================================================
        // CERTIFICATE TITLE
        // =====================================================

        doc
            .font("Helvetica-Bold")
            .fontSize(isWinner ? 31 : 28)
            .fillColor(colors.dark)
            .text(
                isWinner
                    ? "WINNER CERTIFICATE"
                    : "CERTIFICATE OF PARTICIPATION",
                0,
                137,
                {
                    width: W,
                    align: "center"
                }
            );

        // =====================================================
        // SUBTITLE
        // =====================================================

        doc
            .font("Helvetica")
            .fontSize(11)
            .fillColor(colors.muted)
            .text(
                isWinner
                    ? "AWARDED FOR OUTSTANDING PERFORMANCE"
                    : "AWARDED FOR SUCCESSFUL PARTICIPATION",
                0,
                177,
                {
                    width: W,
                    align: "center"
                }
            );

        // =====================================================
        // BADGE
        // =====================================================

        const badgeX = W / 2;
        const badgeY = 225;

        // Outer circle
        doc
            .circle(badgeX, badgeY, 31)
            .fillColor(colors.primary)
            .fill();

        // Inner circle
        doc
            .circle(badgeX, badgeY, 24)
            .fillColor("#FFFFFF")
            .fill();

        // Inner colored circle
        doc
            .circle(badgeX, badgeY, 20)
            .fillColor(colors.primary)
            .fill();

        // Winner badge
        if (isWinner) {

            // Crown-like geometric symbol
            doc
                .save()
                .moveTo(badgeX - 12, badgeY + 7)
                .lineTo(badgeX - 9, badgeY - 8)
                .lineTo(badgeX, badgeY)
                .lineTo(badgeX + 9, badgeY - 8)
                .lineTo(badgeX + 12, badgeY + 7)
                .closePath()
                .fill("#FFFFFF")
                .restore();

            doc
                .lineWidth(2)
                .strokeColor(colors.primary)
                .moveTo(badgeX - 10, badgeY + 9)
                .lineTo(badgeX + 10, badgeY + 9)
                .stroke();

        } else {

            // Check mark
            doc
                .lineWidth(4)
                .strokeColor("#FFFFFF")
                .moveTo(badgeX - 10, badgeY)
                .lineTo(badgeX - 2, badgeY + 9)
                .lineTo(badgeX + 12, badgeY - 9)
                .stroke();
        }

        // =====================================================
        // PRESENTED TO
        // =====================================================

        doc
            .font("Helvetica")
            .fontSize(14)
            .fillColor(colors.text)
            .text(
                "This certificate is proudly presented to",
                0,
                272,
                {
                    width: W,
                    align: "center"
                }
            );

        // =====================================================
        // PARTICIPANT NAME
        // =====================================================

        let participantFontSize = 36;

        if (participantName.length > 30) {
            participantFontSize = 26;
        } else if (participantName.length > 22) {
            participantFontSize = 30;
        }

        doc
            .font("Helvetica-Bold")
            .fontSize(participantFontSize)
            .fillColor(colors.dark)
            .text(
                participantName,
                100,
                300,
                {
                    width: W - 200,
                    align: "center"
                }
            );

        // Name underline
        doc
            .lineWidth(2)
            .strokeColor(colors.primary)
            .moveTo(275, 347)
            .lineTo(566, 347)
            .stroke();

        // =====================================================
        // ACHIEVEMENT TEXT
        // =====================================================

        doc
            .font("Helvetica")
            .fontSize(13)
            .fillColor(colors.text)
            .text(
                isWinner
                    ? "for winning the hackathon"
                    : "for successfully participating in",
                0,
                364,
                {
                    width: W,
                    align: "center"
                }
            );

        // =====================================================
        // HACKATHON NAME
        // =====================================================

        let hackathonFontSize = 25;

        if (hackathonTitle.length > 45) {
            hackathonFontSize = 17;
        } else if (hackathonTitle.length > 32) {
            hackathonFontSize = 20;
        }

        doc
            .font("Helvetica-Bold")
            .fontSize(hackathonFontSize)
            .fillColor(colors.primary)
            .text(
                hackathonTitle,
                100,
                389,
                {
                    width: W - 200,
                    align: "center"
                }
            );

        // =====================================================
        // INFORMATION AREA
        // =====================================================

        const infoTop = 438;

        // Left vertical separator
        doc
            .lineWidth(1)
            .strokeColor("#CBD5E1")
            .moveTo(W / 2, infoTop)
            .lineTo(W / 2, 480)
            .stroke();

        // Certificate ID
        doc
            .font("Helvetica-Bold")
            .fontSize(9)
            .fillColor(colors.dark)
            .text(
                "CERTIFICATE ID",
                80,
                infoTop,
                {
                    width: 300,
                    align: "center"
                }
            );

        doc
            .font("Helvetica")
            .fontSize(8)
            .fillColor(colors.muted)
            .text(
                certificateNumber,
                65,
                infoTop + 16,
                {
                    width: 330,
                    align: "center"
                }
            );

        // Date
        const issueDate = new Date().toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );

        doc
            .font("Helvetica-Bold")
            .fontSize(9)
            .fillColor(colors.dark)
            .text(
                "DATE OF ISSUE",
                540,
                infoTop,
                {
                    width: 220,
                    align: "center"
                }
            );

        doc
            .font("Helvetica")
            .fontSize(9)
            .fillColor(colors.muted)
            .text(
                issueDate,
                540,
                infoTop + 16,
                {
                    width: 220,
                    align: "center"
                }
            );

        // =====================================================
        // SIGNATURES
        // =====================================================

        doc
            .lineWidth(1)
            .strokeColor("#94A3B8")
            .moveTo(150, 510)
            .lineTo(300, 510)
            .stroke();

        doc
            .lineWidth(1)
            .strokeColor("#94A3B8")
            .moveTo(542, 510)
            .lineTo(692, 510)
            .stroke();

        doc
            .font("Helvetica-Bold")
            .fontSize(9)
            .fillColor(colors.dark)
            .text(
                "HackHub Organizer",
                125,
                517,
                {
                    width: 200,
                    align: "center"
                }
            );

        doc
            .font("Helvetica-Bold")
            .fontSize(9)
            .fillColor(colors.dark)
            .text(
                "HackHub Team",
                517,
                517,
                {
                    width: 200,
                    align: "center"
                }
            );

        // =====================================================
        // FOOTER
        // =====================================================

        doc
            .font("Helvetica")
            .fontSize(7)
            .fillColor(colors.muted)
            .text(
                "Digitally generated by HackHub • Hackathon Management Portal",
                0,
                554,
                {
                    width: W,
                    align: "center"
                }
            );

        // =====================================================
        // FINISH PDF
        // =====================================================

        doc.end();

        stream.on("finish", resolve);

        stream.on("error", reject);
    });
};
module.exports = {

    generateCertificates,

    getMyCertificates,

    downloadCertificate,
    createCertificatePDF
};