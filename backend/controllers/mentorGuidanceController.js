const MentorGuidance = require("../models/MentorGuidance");
const Team = require("../models/Team");

// ==========================================
// ADD GUIDANCE
// POST /teams/:id/guidance
// MENTOR ONLY
// ==========================================

const addGuidance = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Guidance message is required"
      });
    }

    // Find team
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }

    // Check whether logged-in mentor is assigned to this team
    if (
      !team.mentor ||
      team.mentor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned as mentor to this team"
      });
    }

    // Create guidance
    const guidance = await MentorGuidance.create({
      mentor: req.user._id,
      team: team._id,
      message: message.trim()
    });

    const populatedGuidance = await MentorGuidance.findById(guidance._id)
      .populate("mentor", "name email")
      .populate("team", "teamName");

    res.status(201).json({
      success: true,
      message: "Guidance added successfully",
      guidance: populatedGuidance
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding guidance",
      error: error.message
    });
  }
};


// ==========================================
// GET TEAM GUIDANCE
// GET /teams/:id/guidance
// MENTOR / PARTICIPANT
// ==========================================

const getGuidance = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }

    const userId = req.user._id.toString();

    // Mentor can view only their assigned team
    const isAssignedMentor =
      team.mentor &&
      team.mentor.toString() === userId;

    // Participant can view only if they belong to the team
    const isTeamMember =
      team.leader.toString() === userId ||
      team.members.some(
        (member) => member.toString() === userId
      );

    if (!isAssignedMentor && !isTeamMember) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this guidance"
      });
    }

    const guidance = await MentorGuidance.find({
      team: team._id
    })
      .populate("mentor", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: guidance.length,
      guidance
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching guidance",
      error: error.message
    });
  }
};


module.exports = {
  addGuidance,
  getGuidance
};