const volunteerHistoryModel = require("../models/volunteerHistoryModel");

// Validate history ID
const validateHistoryId = async (id) => {
  if (!id || isNaN(id)) {
    throw new Error("Invalid history ID");
  }

  const history = await volunteerHistoryModel.getHistoryById(Number(id));
  if (!history) {
    throw new Error("History record not found");
  }

  return history;
};

// Get all volunteer history
const getAllHistory = async (req, res) => {
  try {
    const history = await volunteerHistoryModel.getAllHistory();
    res.status(200).json(history);
  } catch (error) {
    console.error('Error getting all history:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get history for the current user
const getCurrentUserHistory = async (req, res) => {
  try {
    // Get the current user from the session
    const user = req.session.user;
    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Get the history for the current user
    const history = await volunteerHistoryModel.getHistoryByVolunteerId(user.id);
    res.status(200).json(history);
  } catch (error) {
    console.error('Error getting current user history:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get history for a specific volunteer
const getVolunteerHistory = async (req, res) => {
  try {
    const volunteerId = Number(req.params.volunteerId);

    if (!volunteerId || isNaN(volunteerId)) {
      return res.status(400).json({ message: "Invalid volunteer ID" });
    }

    const history = await volunteerHistoryModel.getHistoryByVolunteerId(volunteerId);
    res.status(200).json(history);
  } catch (error) {
    console.error('Error getting volunteer history:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get history for a specific event
const getEventHistory = async (req, res) => {
  try {
    const eventId = Number(req.params.eventId);

    if (!eventId || isNaN(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const history = await volunteerHistoryModel.getHistoryByEventId(eventId);
    res.status(200).json(history);
  } catch (error) {
    console.error('Error getting event history:', error);
    res.status(500).json({ message: error.message });
  }
};

// Add a new history record
const addHistory = async (req, res) => {
  try {
    const {
      volunteerId,
      eventId,
      eventDate,
      status,
      hoursServed,
    } = req.body;

    // Validate required fields
    if (!volunteerId || !eventId || !eventDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate volunteerId and eventId are numbers
    if (isNaN(volunteerId) || isNaN(eventId)) {
      return res
        .status(400)
        .json({ message: "Volunteer ID and Event ID must be numbers" });
    }

    // Validate status if provided
    if (status) {
      const validStatuses = ["Upcoming", "Completed", "Cancelled", "In Progress"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid status. Must be Upcoming, Completed, Cancelled, or In Progress",
        });
      }
    }

    // Validate hoursServed
    if (hoursServed && (isNaN(hoursServed) || hoursServed < 0)) {
      return res
        .status(400)
        .json({ message: "Hours served must be a positive number" });
    }

    // Create the history record
    const newHistory = await volunteerHistoryModel.addHistory({
      volunteerId: Number(volunteerId),
      eventId: Number(eventId),
      eventDate,
      status: status || "Upcoming",
      hoursServed: Number(hoursServed) || 0,
    });

    res.status(201).json({
      message: "History record created successfully",
      history: newHistory,
    });
  } catch (error) {
    console.error('Error adding history:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update history status
const updateStatus = async (req, res) => {
  try {
    const historyId = Number(req.params.id);
    const { status } = req.body;

    // Validate status
    const validStatuses = ["Upcoming", "Completed", "Cancelled", "In Progress"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be Upcoming, Completed, Cancelled, or In Progress",
      });
    }

    // Validate history ID and update the status
    try {
      await validateHistoryId(historyId);
      const updatedHistory = await volunteerHistoryModel.updateHistoryStatus(historyId, status);

      if (!updatedHistory) {
        return res.status(404).json({ message: "History record not found" });
      }

      res.status(200).json({
        message: "Status updated successfully",
        history: updatedHistory,
      });
    } catch (error) {
      return res.status(404).json({ message: error.message });
    }
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(400).json({ message: error.message });
  }
};

// Update hours served
const updateHours = async (req, res) => {
  try {
    const historyId = Number(req.params.id);
    const { hours } = req.body;

    // Validate hours
    if (!hours || isNaN(hours) || Number(hours) < 0) {
      return res
        .status(400)
        .json({ message: "Hours must be a positive number" });
    }

    // Validate history ID and update the hours
    try {
      await validateHistoryId(historyId);
      const updatedHistory = await volunteerHistoryModel.updateHoursServed(
        historyId,
        Number(hours)
      );

      if (!updatedHistory) {
        return res.status(404).json({ message: "History record not found" });
      }

      res.status(200).json({
        message: "Hours updated successfully",
        history: updatedHistory,
      });
    } catch (error) {
      return res.status(404).json({ message: error.message });
    }
  } catch (error) {
    console.error('Error updating hours:', error);
    res.status(400).json({ message: error.message });
  }
};

// Get volunteer statistics
const getVolunteerStats = async (req, res) => {
  try {
    const volunteerId = Number(req.params.volunteerId);

    if (!volunteerId || isNaN(volunteerId)) {
      return res.status(400).json({ message: "Invalid volunteer ID" });
    }

    const stats = await volunteerHistoryModel.getVolunteerStats(volunteerId);
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error getting volunteer stats:', error);
    res.status(500).json({ message: error.message });
  }
};

// Export CSV of volunteer history
const exportHistory = async (req, res) => {
  try {
    const volunteerId = req.query.volunteerId
      ? Number(req.query.volunteerId)
      : null;

    let historyData;
    if (volunteerId) {
      historyData = await volunteerHistoryModel.getHistoryByVolunteerId(volunteerId);
    } else {
      historyData = await volunteerHistoryModel.getAllHistory();
    }

    // Convert to CSV format
    const headers = [
      "ID",
      "Volunteer ID",
      "Event ID",
      "Event Name",
      "Event Description",
      "Event Location",
      "Required Skills",
      "Urgency",
      "Event Date",
      "Status",
      "Hours Served",
    ].join(",");

    const rows = historyData.map((h) =>
      [
        h.id,
        h.volunteerId,
        h.eventId,
        `"${h.eventName}"`,
        `"${h.eventDescription}"`,
        `"${h.eventLocation}"`,
        `"${h.requiredSkills.join("; ")}"`,
        h.urgency,
        h.eventDate,
        h.status,
        h.hoursServed,
      ].join(",")
    );

    const csv = [headers, ...rows].join("\n");

    // Set response headers for CSV download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=volunteer-history.csv"
    );

    res.status(200).send(csv);
  } catch (error) {
    console.error('Error exporting history:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllHistory,
  getCurrentUserHistory,
  getVolunteerHistory,
  getEventHistory,
  addHistory,
  updateStatus,
  updateHours,
  getVolunteerStats,
  exportHistory,
};
