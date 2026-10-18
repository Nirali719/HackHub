const Hackathon = require("../models/Hackathon");
const getCurrentHackathonStatus = (hackathon) => {
    const now = new Date();

    if (hackathon.status === "cancelled") {
        return "cancelled";
    }

    if (hackathon.status === "draft") {
        return "draft";
    }

    if (now < new Date(hackathon.startDate)) {
        return "published";
    }

    if (
        now >= new Date(hackathon.startDate) &&
        now <= new Date(hackathon.endDate)
    ) {
        return "ongoing";
    }

    if (now > new Date(hackathon.endDate)) {
        return "completed";
    }

    return hackathon.status;
};

// Create Hackathon
const createHackathon = async (req, res) => {
  try {
    const {
      title,
      description,
      // organizer,
      eligibility,
      rules,
      registrationDeadline,
      submissionDeadline,
      startDate,
      endDate,
      maxTeamSize,
      status,
    } = req.body;

    if (
      !title ||
      !description ||
      // !organizer ||
      !registrationDeadline ||
      !submissionDeadline ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }
      // Registration deadline must be before submission deadline
if (
    new Date(registrationDeadline) >
    new Date(submissionDeadline)
) {
    return res.status(400).json({
        success: false,
        message:
            "Registration deadline cannot be after the submission deadline"
    });
}


// Submission deadline must not be after hackathon end
if (
    new Date(submissionDeadline) >
    new Date(endDate)
) {
    return res.status(400).json({
        success: false,
        message:
            "Submission deadline cannot be after the hackathon end date"
    });
}


// Start date must not be after end date
if (
    new Date(startDate) >
    new Date(endDate)
) {
    return res.status(400).json({
        success: false,
        message:
            "Start date cannot be after the end date"
    });
}
  

    const hackathon = await Hackathon.create({
      title,
      description,
      eligibility,
      rules,
      registrationDeadline,
      submissionDeadline,
      startDate,
      endDate,
      maxTeamSize,
      status,
      organizer: req.user._id
    });

    res.status(201).json({
      success: true,
      message: "Hackathon created successfully",
      hackathon,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating hackathon",
      error: error.message,
    });
  }
};


// Get All Hackathons
const getHackathons = async (req, res) => {
    try {
        const hackathons = await Hackathon.find()
            .populate("organizer", "name email role")
            .sort({ createdAt: -1 });

        const updatedHackathons = hackathons.map((hackathon) => {
            const currentStatus =
                getCurrentHackathonStatus(hackathon);

            return {
                ...hackathon.toObject(),
                status: currentStatus
            };
        });

        res.status(200).json({
            success: true,
            count: updatedHackathons.length,
            hackathons: updatedHackathons
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching hackathons",
            error: error.message
        });
    }
};


// Get Single Hackathon
const getHackathonById = async (req, res) => {
    try {
        const hackathon = await Hackathon.findById(req.params.id)
            .populate("organizer", "name email role");

        if (!hackathon) {
            return res.status(404).json({
                success: false,
                message: "Hackathon not found"
            });
        }

        const currentStatus =
            getCurrentHackathonStatus(hackathon);

        const updatedHackathon = {
            ...hackathon.toObject(),
            status: currentStatus
        };

        res.status(200).json({
            success: true,
            hackathon: updatedHackathon
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching hackathon",
            error: error.message
        });
    }
};


// Update Hackathon
const updateHackathon = async (req, res) => {
  try {
    const existingHackathon = await Hackathon.findById(req.params.id);

    if (!existingHackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found",
      });
    }

    const {
      registrationDeadline,
      submissionDeadline
    } = req.body;

    // Use the new value if provided,
    // otherwise keep the existing value.
    const finalRegistrationDeadline =
      registrationDeadline ||
      existingHackathon.registrationDeadline;

    const finalSubmissionDeadline =
      submissionDeadline ||
      existingHackathon.submissionDeadline;

    // Registration deadline cannot be after submission deadline
    if (
      new Date(finalRegistrationDeadline) >
      new Date(finalSubmissionDeadline)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Registration deadline cannot be after the submission deadline"
      });
    }

    const hackathon = await Hackathon.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Hackathon updated successfully",
      hackathon,
    });

  } catch (error) {
    console.error("Update Hackathon Error:", error);

    res.status(500).json({
      success: false,
      message: "Error updating hackathon",
      error: error.message,
    });
  }
};


// Delete Hackathon
const deleteHackathon = async (req, res) => {
  try {
    const hackathon = await Hackathon.findByIdAndDelete(req.params.id);

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Hackathon deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting hackathon",
      error: error.message,
    });
  }
};


module.exports = {
  createHackathon,
  getHackathons,
  getHackathonById,
  updateHackathon,
  deleteHackathon,
};