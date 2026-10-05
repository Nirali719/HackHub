const Submission = require("../models/Submission");
const Team = require("../models/Team");
const Hackathon = require("../models/Hackathon");

const fs = require("fs");
const path = require("path");

const {
    maxSizeMB
} = require("../middleware/uploadMiddleware");

// ==========================================
// CREATE SUBMISSION
// TEAM LEADER ONLY
// ==========================================

const createSubmission = async (req, res) => {

    try {

        const {
            hackathon,
            team,
            projectTitle,
            description,
            githubUrl,
            demoUrl
        } = req.body;


        if (
            !hackathon ||
            !team ||
            !projectTitle ||
            !description ||
            !githubUrl
        ) {

            if (req.file) {
                fs.unlinkSync(
                    req.file.path
                );
            }

            return res.status(400).json({
                success: false,
                message:
                    "Hackathon, team, project title, description and GitHub URL are required"
            });
        }


        // PDF required for new submission

        if (!req.file) {

            return res.status(400).json({
                success: false,
                message:
                    "Submission PDF is required"
            });
        }


        const hackathonData =
            await Hackathon.findById(
                hackathon
            );

        if (!hackathonData) {

            fs.unlinkSync(
                req.file.path
            );

            return res.status(404).json({
                success: false,
                message:
                    "Hackathon not found"
            });
        }


        const teamData =
            await Team.findById(team);

        if (!teamData) {

            fs.unlinkSync(
                req.file.path
            );

            return res.status(404).json({
                success: false,
                message:
                    "Team not found"
            });
        }


        if (
            teamData.hackathon.toString() !==
            hackathon.toString()
        ) {

            fs.unlinkSync(
                req.file.path
            );

            return res.status(400).json({
                success: false,
                message:
                    "Team does not belong to this hackathon"
            });
        }


        if (
            req.user.role !== "admin" &&
            teamData.leader.toString() !==
                req.user._id.toString()
        ) {

            fs.unlinkSync(
                req.file.path
            );

            return res.status(403).json({
                success: false,
                message:
                    "Only the team leader can create a submission"
            });
        }


        const existingSubmission =
            await Submission.findOne({
                hackathon,
                team
            });

        if (existingSubmission) {

            fs.unlinkSync(
                req.file.path
            );

            return res.status(400).json({
                success: false,
                message:
                    "A submission already exists for this team"
            });
        }


        const submission =
            await Submission.create({

                hackathon,

                team,

                projectTitle,

                description,

                githubUrl,

                demoUrl,

                pdfFileName:
                    req.file.filename,

                pdfOriginalName:
                    req.file.originalname,

                pdfFilePath:
                    req.file.path,

                pdfSize:
                    req.file.size,

                status: "draft",

                submissionDate:
                    new Date()
            });


        const populatedSubmission =
            await Submission.findById(
                submission._id
            )
                .populate(
                    "hackathon",
                    "title submissionDeadline status"
                )
                .populate(
                    "team",
                    "teamName leader members"
                );


        res.status(201).json({
            success: true,
            message:
                "Submission created successfully",
            submission:
                populatedSubmission
        });


    } catch (error) {

        if (req.file) {

            try {
                fs.unlinkSync(
                    req.file.path
                );
            } catch {}
        }

        console.error(
            "Create Submission Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Error creating submission",
            error:
                error.message
        });
    }
};


// ==========================================
// GET ALL SUBMISSIONS
// ALL LOGGED-IN USERS
// ==========================================

const getSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate("hackathon", "title status submissionDeadline")
      .populate("team", "teamName leader members")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      submissions
    });

  } catch (error) {
    console.error("Get Submissions Error:", error);

    res.status(500).json({
      success: false,
      message: "Error fetching submissions",
      error: error.message
    });
  }
};

// ==========================================
// GET ALL SUBMISSIONS
// ALL LOGGED-IN USERS
// ==========================================

const getSubmissionByTeam = async (req, res) => {
  try {
    const { teamId } = req.params;

    console.log("=================================");
    console.log("GET SUBMISSION BY TEAM");
    console.log("Team ID:", teamId);
    console.log("Logged in user:", req.user._id);
    console.log("Role:", req.user.role);

    const team = await Team.findById(teamId);

    if (!team) {
      console.log("TEAM NOT FOUND");

      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }

    console.log("Team found:", team._id);
    console.log("Team mentor:", team.mentor);

    // Mentor authorization
    if (req.user.role === "mentor") {

      if (
        !team.mentor ||
        team.mentor.toString() !== req.user._id.toString()
      ) {
        console.log("MENTOR NOT ASSIGNED TO THIS TEAM");

        return res.status(403).json({
          success: false,
          message: "You are not assigned to this team"
        });
      }
    }

    const submission = await Submission.findOne({
      team: teamId
    })
      .populate(
        "hackathon",
        "title status submissionDeadline"
      )
      .populate(
        "team",
        "teamName leader members mentor"
      );

    console.log(
      "Submission found:",
      submission ? submission._id : "NONE"
    );

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "No submission found for this team"
      });
    }

    return res.status(200).json({
      success: true,
      submission
    });

  } catch (error) {

    console.error(
      "GET SUBMISSION BY TEAM ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Error fetching team submission",
      error: error.message
    });
  }
};


// ==========================================
// GET SINGLE SUBMISSION
// ALL LOGGED-IN USERS
// ==========================================

const getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate("hackathon", "title status submissionDeadline")
      .populate("team", "teamName leader members");

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found"
      });
    }

    res.status(200).json({
      success: true,
      submission
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching submission",
      error: error.message
    });
  }
};


// ==========================================
// UPDATE SUBMISSION
// TEAM LEADER OR ADMIN
// ==========================================

const updateSubmission = async (req, res) => {
  try {
    const {
      projectTitle,
      description,
      githubUrl,
      demoUrl
    } = req.body;

    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found"
      });
    }

    // Get team
    const team = await Team.findById(submission.team);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }

    // Check team leader ownership
    if (
      req.user.role !== "admin" &&
      team.leader.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Only the team leader can update this submission"
      });
    }

    // Cannot modify evaluated submission
    if (submission.status === "evaluated") {
      return res.status(400).json({
        success: false,
        message: "Evaluated submission cannot be modified"
      });
    }

    if (projectTitle) {
      submission.projectTitle = projectTitle;
    }

    if (description) {
      submission.description = description;
    }

    if (githubUrl) {
      submission.githubUrl = githubUrl;
    }

    if (demoUrl !== undefined) {
      submission.demoUrl = demoUrl;
    }
if (req.file) {

    if (
        submission.pdfFilePath &&
        fs.existsSync(
            submission.pdfFilePath
        )
    ) {
        fs.unlinkSync(
            submission.pdfFilePath
        );
    }

    submission.pdfFileName =
        req.file.filename;

    submission.pdfOriginalName =
        req.file.originalname;

    submission.pdfFilePath =
        req.file.path;

    submission.pdfSize =
        req.file.size;
}
    await submission.save();

    const updatedSubmission = await Submission.findById(submission._id)
      .populate("hackathon", "title submissionDeadline status")
      .populate("team", "teamName leader members");

    res.status(200).json({
      success: true,
      message: "Submission updated successfully",
      submission: updatedSubmission
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating submission",
      error: error.message
    });
  }
};


// ==========================================
// DELETE SUBMISSION
// TEAM LEADER OR ADMIN
// ==========================================

const deleteSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found"
      });
    }

    const team = await Team.findById(submission.team);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }

    // Check team leader
    if (
      req.user.role !== "admin" &&
      team.leader.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Only the team leader can delete this submission"
      });
    }

    // Optional: Don't allow deleting evaluated submission
    if (submission.status === "evaluated") {
      return res.status(400).json({
        success: false,
        message: "Evaluated submission cannot be deleted"
      });
    }

    await Submission.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Submission deleted successfully"
    });
    if (
    submission.pdfFilePath &&
    fs.existsSync(
        submission.pdfFilePath
    )
) {

    fs.unlinkSync(
        submission.pdfFilePath
    );
}

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting submission",
      error: error.message
    });
  }
};


// ==========================================
// SUBMIT PROJECT
// TEAM LEADER ONLY
// ==========================================

const submitSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate("hackathon", "title submissionDeadline status");

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found"
      });
    }

    // Get team
    const team = await Team.findById(submission.team);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }

    // Check team leader
    if (
      req.user.role !== "admin" &&
      team.leader.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Only the team leader can submit this project"
      });
    }

    // Already submitted
    if (
      submission.status === "submitted" ||
      submission.status === "under_review" ||
      submission.status === "evaluated"
    ) {
      return res.status(400).json({
        success: false,
        message: "Submission has already been submitted"
      });
    }

    // Check deadline
    if (
      submission.hackathon.submissionDeadline &&
      new Date() > new Date(submission.hackathon.submissionDeadline)
    ) {
      return res.status(400).json({
        success: false,
        message: "Submission deadline has passed"
      });
    }
  if (
    !submission.pdfFilePath ||
    !fs.existsSync(
        submission.pdfFilePath
    )
  ) {

    return res.status(400).json({
        success: false,
        message:
            "Please upload the submission PDF before submitting the project"
    });
    }

    submission.status = "submitted";
    submission.submissionDate = new Date();

    await submission.save();

    res.status(200).json({
      success: true,
      message: "Project submitted successfully",
      submission
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error submitting project",
      error: error.message
    });
  }
};
const downloadSubmissionPdf = async (
    req,
    res
) => {

    try {

        const submission =
            await Submission.findById(
                req.params.id
            ).populate(
                "team",
                "teamName leader members"
            );


        if (!submission) {

            return res.status(404).json({
                success: false,
                message:
                    "Submission not found"
            });
        }


        const team =
            submission.team;


        const isMember =
            team.members.some(
                (member) =>
                    member.toString() ===
                    req.user._id.toString()
            );


        const isLeader =
            team.leader.toString() ===
            req.user._id.toString();


        const allowed =
            req.user.role === "admin" ||
            req.user.role === "judge" ||
            req.user.role === "mentor" ||
            isMember ||
            isLeader;


        if (!allowed) {

            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized to download this PDF"
            });
        }


        if (
            !submission.pdfFilePath ||
            !fs.existsSync(
                submission.pdfFilePath
            )
        ) {

            return res.status(404).json({
                success: false,
                message:
                    "Submission PDF not found"
            });
        }


        res.download(
            submission.pdfFilePath,
            submission.pdfOriginalName ||
                "submission.pdf"
        );


    } catch (error) {

        console.error(
            "Download Submission PDF Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Error downloading submission PDF"
        });
    }
};


module.exports = {
  createSubmission,
  getSubmissions,
  getSubmissionById,
  updateSubmission,
  deleteSubmission,
  submitSubmission,
  getSubmissionByTeam,
  downloadSubmissionPdf
};