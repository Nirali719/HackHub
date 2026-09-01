const Team = require("../models/Team");
const Hackathon = require("../models/Hackathon");
const User = require("../models/User");


// ==========================================
// CREATE TEAM
// POST /api/teams
// PARTICIPANT ONLY
// ==========================================

const createTeam = async (req, res) => {
  try {
    const { teamName, hackathon } = req.body;

    if (!teamName || !hackathon) {
      return res.status(400).json({
        success: false,
        message: "Team name and hackathon are required"
      });
    }

    // Check hackathon exists
    const hackathonData = await Hackathon.findById(hackathon);

    if (!hackathonData) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found"
      });
    }

    // Check if participant already has a team
    const existingTeam = await Team.findOne({
      hackathon: hackathon,
      leader: req.user._id
    });

    if (existingTeam) {
      return res.status(400).json({
        success: false,
        message: "You already lead a team in this hackathon"
      });
    }

    // Create team
    const team = await Team.create({
      teamName,
      hackathon,
      leader: req.user._id,
      members: [req.user._id]
    });

    res.status(201).json({
      success: true,
      message: "Team created successfully",
      team
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating team",
      error: error.message
    });
  }
};


// ==========================================
// GET ALL TEAMS
// GET /api/teams
// PARTICIPANT AND ADMIN
// ==========================================

const getTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate("hackathon", "title status")
      .populate("leader", "name email")
      .populate("members", "name email");

    res.status(200).json({
      success: true,
      count: teams.length,
      teams
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching teams",
      error: error.message
    });
  }
};


// ==========================================
// GET SINGLE TEAM
// GET /api/teams/:id
// PARTICIPANT AND ADMIN
// ==========================================

const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate("hackathon", "title status")
      .populate("leader", "name email")
      .populate("members", "name email");

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }

    res.status(200).json({
      success: true,
      team
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching team",
      error: error.message
    });
  }
};


// ==========================================
// UPDATE TEAM
// PUT /api/teams/:id
// TEAM LEADER OR ADMIN
// ==========================================

const updateTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }

    // Check ownership
    if (
      req.user.role !== "admin" &&
      team.leader.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Only the team leader can update this team"
      });
    }

    const { teamName, status } = req.body;

    if (teamName) {
      team.teamName = teamName;
    }

    if (status) {
      team.status = status;
    }

    await team.save();

    res.status(200).json({
      success: true,
      message: "Team updated successfully",
      team
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating team",
      error: error.message
    });
  }
};


// ==========================================
// DELETE TEAM
// DELETE /api/teams/:id
// TEAM LEADER OR ADMIN
// ==========================================

const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }

    // Check ownership
    if (
      req.user.role !== "admin" &&
      team.leader.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Only the team leader can delete this team"
      });
    }

    await Team.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Team deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting team",
      error: error.message
    });
  }
};


// ==========================================
// ADD TEAM MEMBER
// POST /api/teams/:id/members
// TEAM LEADER OR ADMIN
// ==========================================

const addTeamMember = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }

    // Check ownership
    if (
      req.user.role !== "admin" &&
      team.leader.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Only the team leader can add members"
      });
    }

    // Check user exists
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Only participants can join teams
    if (user.role !== "participant") {
      return res.status(400).json({
        success: false,
        message: "Only participants can be team members"
      });
    }

    // Check if already a member
    if (team.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "User is already a team member"
      });
    }

    team.members.push(userId);

    await team.save();

    res.status(200).json({
      success: true,
      message: "Member added successfully",
      team
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding team member",
      error: error.message
    });
  }
};


// ==========================================
// REMOVE TEAM MEMBER
// DELETE /api/teams/:id/members/:userId
// TEAM LEADER OR ADMIN
// ==========================================

const removeTeamMember = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }

    // Check ownership
    if (
      req.user.role !== "admin" &&
      team.leader.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Only the team leader can remove members"
      });
    }

    const { userId } = req.params;

    // Prevent removing team leader
    if (team.leader.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: "Team leader cannot be removed"
      });
    }

    // Check member exists in team
    const isMember = team.members.some(
      member => member.toString() === userId
    );

    if (!isMember) {
      return res.status(404).json({
        success: false,
        message: "User is not a member of this team"
      });
    }

    // Remove member
    team.members = team.members.filter(
      member => member.toString() !== userId
    );

    await team.save();

    res.status(200).json({
      success: true,
      message: "Member removed successfully",
      team
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error removing team member",
      error: error.message
    });
  }
};


module.exports = {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember
};