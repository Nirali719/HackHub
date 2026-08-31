const Team = require("../models/Team");
const User = require("../models/User");
const Hackathon = require("../models/Hackathon");

// ==========================================
// CREATE TEAM
// ==========================================

const createTeam = async (req, res) => {
  try {
    const { teamName, hackathon, leader } = req.body;

    // Check required fields
    if (!teamName || !hackathon || !leader) {
      return res.status(400).json({
        success: false,
        message: "Team name, hackathon and leader are required",
      });
    }

    // Check hackathon
    const hackathonData = await Hackathon.findById(hackathon);

    if (!hackathonData) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found",
      });
    }

    // Check leader
    const leaderUser = await User.findById(leader);

    if (!leaderUser) {
      return res.status(404).json({
        success: false,
        message: "Leader not found",
      });
    }

    // Leader should be participant
    if (leaderUser.role !== "participant") {
      return res.status(400).json({
        success: false,
        message: "Only participants can create teams",
      });
    }

    // Check if leader already has a team in this hackathon
    const existingTeam = await Team.findOne({
      hackathon,
      members: leader,
    });

    if (existingTeam) {
      return res.status(400).json({
        success: false,
        message: "This participant is already in a team",
      });
    }

    // Check duplicate team name
    const existingTeamName = await Team.findOne({
      teamName,
      hackathon,
    });

    if (existingTeamName) {
      return res.status(400).json({
        success: false,
        message: "Team name already exists in this hackathon",
      });
    }

    // Create team
    const team = await Team.create({
      teamName,
      hackathon,
      leader,
      members: [leader],
    });

    const populatedTeam = await Team.findById(team._id)
      .populate("leader", "name email college")
      .populate("members", "name email college")
      .populate("hackathon", "title maxTeamSize");

    res.status(201).json({
      success: true,
      message: "Team created successfully",
      team: populatedTeam,
    });
  } catch (error) {
    console.error("Create Team Error:", error);

    res.status(500).json({
      success: false,
      message: "Error creating team",
      error: error.message,
    });
  }
};


// ==========================================
// GET ALL TEAMS
// ==========================================

const getTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate("leader", "name email college")
      .populate("members", "name email college")
      .populate("hackathon", "title maxTeamSize status")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: teams.length,
      teams,
    });
  } catch (error) {
    console.error("Get Teams Error:", error);

    res.status(500).json({
      success: false,
      message: "Error fetching teams",
      error: error.message,
    });
  }
};


// ==========================================
// GET TEAM BY ID
// ==========================================

const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate("leader", "name email college")
      .populate("members", "name email college")
      .populate("hackathon", "title maxTeamSize status");

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    res.status(200).json({
      success: true,
      team,
    });
  } catch (error) {
    console.error("Get Team Error:", error);

    res.status(500).json({
      success: false,
      message: "Error fetching team",
      error: error.message,
    });
  }
};


// ==========================================
// UPDATE TEAM
// ==========================================

const updateTeam = async (req, res) => {
  try {
    const { teamName, status } = req.body;

    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    if (teamName) {
      const duplicateTeam = await Team.findOne({
        teamName,
        hackathon: team.hackathon,
        _id: { $ne: team._id },
      });

      if (duplicateTeam) {
        return res.status(400).json({
          success: false,
          message: "Team name already exists in this hackathon",
        });
      }

      team.teamName = teamName;
    }

    if (status) {
      team.status = status;
    }

    await team.save();

    const updatedTeam = await Team.findById(team._id)
      .populate("leader", "name email college")
      .populate("members", "name email college")
      .populate("hackathon", "title maxTeamSize status");

    res.status(200).json({
      success: true,
      message: "Team updated successfully",
      team: updatedTeam,
    });
  } catch (error) {
    console.error("Update Team Error:", error);

    res.status(500).json({
      success: false,
      message: "Error updating team",
      error: error.message,
    });
  }
};


// ==========================================
// DELETE TEAM
// ==========================================

const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Team deleted successfully",
    });
  } catch (error) {
    console.error("Delete Team Error:", error);

    res.status(500).json({
      success: false,
      message: "Error deleting team",
      error: error.message,
    });
  }
};


// ==========================================
// ADD TEAM MEMBER
// ==========================================

const addTeamMember = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "participant") {
      return res.status(400).json({
        success: false,
        message: "Only participants can join teams",
      });
    }

    // Check team size
    const hackathon = await Hackathon.findById(team.hackathon);

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found",
      });
    }

    if (team.members.length >= hackathon.maxTeamSize) {
      return res.status(400).json({
        success: false,
        message: `Team cannot have more than ${hackathon.maxTeamSize} members`,
      });
    }

    // Check if user is already in this team
    if (team.members.some((member) => member.toString() === userId)) {
      return res.status(400).json({
        success: false,
        message: "User is already a member of this team",
      });
    }

    // Check if user is already in another team for same hackathon
    const anotherTeam = await Team.findOne({
      hackathon: team.hackathon,
      members: userId,
    });

    if (anotherTeam) {
      return res.status(400).json({
        success: false,
        message: "User is already a member of another team",
      });
    }

    team.members.push(userId);

    // Team becomes ready when maximum size is reached
    if (team.members.length >= hackathon.maxTeamSize) {
      team.status = "ready";
    }

    await team.save();

    const updatedTeam = await Team.findById(team._id)
      .populate("leader", "name email college")
      .populate("members", "name email college")
      .populate("hackathon", "title maxTeamSize");

    res.status(200).json({
      success: true,
      message: "Member added successfully",
      team: updatedTeam,
    });
  } catch (error) {
    console.error("Add Team Member Error:", error);

    res.status(500).json({
      success: false,
      message: "Error adding team member",
      error: error.message,
    });
  }
};


// ==========================================
// REMOVE TEAM MEMBER
// ==========================================

const removeTeamMember = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const team = await Team.findById(id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    // Leader cannot be removed
    if (team.leader.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: "Team leader cannot be removed",
      });
    }

    const memberExists = team.members.some(
      (member) => member.toString() === userId
    );

    if (!memberExists) {
      return res.status(404).json({
        success: false,
        message: "User is not a member of this team",
      });
    }

    team.members = team.members.filter(
      (member) => member.toString() !== userId
    );

    if (team.status === "ready") {
      team.status = "forming";
    }

    await team.save();

    res.status(200).json({
      success: true,
      message: "Team member removed successfully",
      team,
    });
  } catch (error) {
    console.error("Remove Team Member Error:", error);

    res.status(500).json({
      success: false,
      message: "Error removing team member",
      error: error.message,
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
  removeTeamMember,
};