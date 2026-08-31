const Registration = require("../models/Registration");
const User = require("../models/User");
const Hackathon = require("../models/Hackathon");


// Register participant
const createRegistration = async (req, res) => {
  try {
    const {
      participant,
      hackathon,
    } = req.body;

    if (!participant || !hackathon) {
      return res.status(400).json({
        success: false,
        message: "Participant and hackathon are required",
      });
    }

    const user = await User.findById(participant);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Participant not found",
      });
    }

    if (user.role !== "participant") {
      return res.status(400).json({
        success: false,
        message: "Only participants can register",
      });
    }

    const hackathonData = await Hackathon.findById(hackathon);

    if (!hackathonData) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found",
      });
    }

    const existingRegistration = await Registration.findOne({
      participant,
      hackathon,
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: "Already registered for this hackathon",
      });
    }

    const registration = await Registration.create({
      participant,
      hackathon,
    });

    res.status(201).json({
      success: true,
      message: "Registration created successfully",
      registration,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating registration",
      error: error.message,
    });
  }
};


// Get registrations
const getRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find()
      .populate("participant", "name email college role")
      .populate("hackathon", "title status");

    res.status(200).json({
      success: true,
      count: registrations.length,
      registrations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching registrations",
      error: error.message,
    });
  }
};


// Get one registration
const getRegistrationById = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate("participant", "name email college role")
      .populate("hackathon", "title status");

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    res.status(200).json({
      success: true,
      registration,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching registration",
      error: error.message,
    });
  }
};


// Update registration status
const updateRegistration = async (req, res) => {
  try {
    const { status } = req.body;

    const registration = await Registration.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Registration updated successfully",
      registration,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating registration",
      error: error.message,
    });
  }
};


// Cancel/delete registration
const deleteRegistration = async (req, res) => {
  try {
    const registration = await Registration.findByIdAndDelete(
      req.params.id
    );

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Registration cancelled successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error cancelling registration",
      error: error.message,
    });
  }
};


module.exports = {
  createRegistration,
  getRegistrations,
  getRegistrationById,
  updateRegistration,
  deleteRegistration,
};