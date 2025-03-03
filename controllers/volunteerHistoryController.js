const volunteerHistoryModel = require("../models/volunteerHistoryModel");

// Validate history ID
const validateHistoryId = (id) => {
  if (!id || isNaN(id)) {
    throw new Error("Invalid history ID");
  }

  const history = volunteerHistoryModel.getHistoryById(Number(id));
  if (!history) {
    throw new Error("History record not found");
  }

  return history;
};

// Get all volunteer history
const getAllHistory = (req, res) => {
  try {
    const history = volunteerHistoryModel.getAllHistory();
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get history for a specific volunteer
const getVolunteerHistory = (req, res) => {
  try {
    const volunteerId = Number(req.params.volunteerId);

    if (!volunteerId || isNaN(volunteerId)) {
      return res.status(400).json({ message: "Invalid volunteer ID" });
    }

    const history = volunteerHistoryModel.getHistoryByVolunteerId(volunteerId);
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get history for a specific event
const getEventHistory = (req, res) => {
  try {
    const eventId = Number(req.params.eventId);

    if (!eventId || isNaN(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const history = volunteerHistoryModel.getHistoryByEventId(eventId);
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a new history record
const addHistory = (req, res) => {
  try {
    const {
      volunteerId,
      eventId,
      eventName,
      eventDescription,
      eventLocation,
      requiredSkills,
      urgency,
      eventDate,
      status,
      hoursServed,
    } = req.body;

    // Validate required fields
    if (
      !volunteerId ||
      !eventId ||
      !eventName ||
      !eventLocation ||
      !eventDate ||
      !status
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate volunteerId and eventId are numbers
    if (isNaN(volunteerId) || isNaN(eventId)) {
      return res
        .status(400)
        .json({ message: "Volunteer ID and Event ID must be numbers" });
    }

    // Validate status
    const validStatuses = ["Upcoming", "Completed", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be Upcoming, Completed, or Cancelled",
      });
    }

    // Validate hoursServed
    if (hoursServed && (isNaN(hoursServed) || hoursServed < 0)) {
      return res
        .status(400)
        .json({ message: "Hours served must be a positive number" });
    }

    // Create the history record
    const newHistory = volunteerHistoryModel.addHistory({
      volunteerId: Number(volunteerId),
      eventId: Number(eventId),
      eventName,
      eventDescription: eventDescription || "",
      eventLocation,
      requiredSkills: requiredSkills || [],
      urgency: urgency || "Medium",
      eventDate,
      status,
      hoursServed: Number(hoursServed) || 0,
    });

    res.status(201).json({
      message: "History record created successfully",
      history: newHistory,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update history status
const updateStatus = (req, res) => {
  try {
    const historyId = Number(req.params.id);
    const { status } = req.body;

    // Validate history ID
    validateHistoryId(historyId);

    // Validate status
    const validStatuses = ["Upcoming", "Completed", "Cancelled"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be Upcoming, Completed, or Cancelled",
      });
    }

    // Update the status
    const updatedHistory = volunteerHistoryModel.updateHistoryStatus(
      historyId,
      status
    );

    if (!updatedHistory) {
      return res.status(404).json({ message: "History record not found" });
    }

    res.status(200).json({
      message: "Status updated successfully",
      history: updatedHistory,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update hours served
const updateHours = (req, res) => {
  try {
    const historyId = Number(req.params.id);
    const { hours } = req.body;

    // Validate history ID
    validateHistoryId(historyId);

    // Validate hours
    if (!hours || isNaN(hours) || Number(hours) < 0) {
      return res
        .status(400)
        .json({ message: "Hours must be a positive number" });
    }

    // Update the hours
    const updatedHistory = volunteerHistoryModel.updateHoursServed(
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
    res.status(400).json({ message: error.message });
  }
};

// Get volunteer statistics
const getVolunteerStats = (req, res) => {
  try {
    const volunteerId = Number(req.params.volunteerId);

    if (!volunteerId || isNaN(volunteerId)) {
      return res.status(400).json({ message: "Invalid volunteer ID" });
    }

    const stats = volunteerHistoryModel.getVolunteerStats(volunteerId);
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export CSV of volunteer history
const exportHistory = (req, res) => {
  try {
    const volunteerId = req.query.volunteerId
      ? Number(req.query.volunteerId)
      : null;

    let historyData;
    if (volunteerId) {
      historyData = volunteerHistoryModel.getHistoryByVolunteerId(volunteerId);
    } else {
      historyData = volunteerHistoryModel.getAllHistory();
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
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllHistory,
  getVolunteerHistory,
  getEventHistory,
  addHistory,
  updateStatus,
  updateHours,
  getVolunteerStats,
  exportHistory,
};
