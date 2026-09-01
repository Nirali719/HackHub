const Registration = require("../models/Registration");
const Hackathon = require("../models/Hackathon");


// ==========================================
// CREATE REGISTRATION
// POST /registrations
// PARTICIPANT ONLY
// ==========================================

const createRegistration = async (req, res) => {
  try {
    const { hackathon } = req.body;

    if (!hackathon) {
      return res.status(400).json({
        success: false,
        message: "Hackathon is required"
      });
    }

    // Check if hackathon exists
    const hackathonData = await Hackathon.findById(hackathon);

    if (!hackathonData) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found"
      });
    }

    // Check if participant already registered
    const existingRegistration = await Registration.findOne({
      participant: req.user._id,
      hackathon: hackathon
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: "Already registered for this hackathon"
      });
    }

    // Create registration for logged-in participant
    const registration = await Registration.create({
      participant: req.user._id,
      hackathon: hackathon
    });

    res.status(201).json({
      success: true,
      message: "Registration created successfully",
      registration
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating registration",
      error: error.message
    });
  }
};


// ==========================================
// GET REGISTRATIONS
// GET /registrations
// PARTICIPANT → OWN REGISTRATIONS
// ADMIN → ALL REGISTRATIONS
// ==========================================

const getRegistrations = async (req, res) => {
  try {
    let registrations;

    // Admin can see all registrations
    if (req.user.role === "admin") {
      registrations = await Registration.find()
        .populate("participant", "name email college role")
        .populate("hackathon", "title status");
    } 
    
    // Participant can see only their registrations
    else {
      registrations = await Registration.find({
        participant: req.user._id
      })
        .populate("participant", "name email college role")
        .populate("hackathon", "title status");
    }

    res.status(200).json({
      success: true,
      count: registrations.length,
      registrations
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching registrations",
      error: error.message
    });
  }
};


// ==========================================
// GET SINGLE REGISTRATION
// GET /registrations/:id
// PARTICIPANT → OWN ONLY
// ADMIN → ANY
// ==========================================

const getRegistrationById = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate("participant", "name email college role")
      .populate("hackathon", "title status");

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found"
      });
    }

    // Participant can only see their own registration
    if (
      req.user.role === "participant" &&
      registration.participant._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this registration"
      });
    }

    res.status(200).json({
      success: true,
      registration
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching registration",
      error: error.message
    });
  }
};


// ==========================================
// UPDATE REGISTRATION STATUS
// PUT /registrations/:id
// ADMIN ONLY
// ==========================================

const updateRegistration = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required"
      });
    }

    const registration = await Registration.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true
      }
    );

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Registration updated successfully",
      registration
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating registration",
      error: error.message
    });
  }
};


// ==========================================
// CANCEL REGISTRATION
// DELETE /registrations/:id
// PARTICIPANT → OWN ONLY
// ADMIN → ANY
// ==========================================

const deleteRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found"
      });
    }

    // Participant can delete only their own registration
    if (
      req.user.role === "participant" &&
      registration.participant.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to cancel this registration"
      });
    }

    await Registration.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Registration cancelled successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error cancelling registration",
      error: error.message
    });
  }
};


// ==========================================
// EXPORT FUNCTIONS
// ==========================================

module.exports = {
  createRegistration,
  getRegistrations,
  getRegistrationById,
  updateRegistration,
  deleteRegistration
};