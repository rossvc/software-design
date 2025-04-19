// controllers/reportController.js
const PDFDocument = require('pdfkit');
const { createObjectCsvStringifier } = require('csv-writer');
const volunteerMatchingModel = require('../models/volunteerMatchingModel');
const volunteerHistoryModel = require('../models/volunteerHistoryModel');
const createEventModel = require('../models/createEventModel');

// Helper: Check if user is admin (from session)
function isAdmin(req) {
  // Session-based auth: req.session.user exists and role is admin
  return req.session && req.session.user && req.session.user.role === 'admin';
}

// Fetch all volunteers and their participation history
async function getVolunteerParticipation() {
  const volunteers = await volunteerMatchingModel.getAllVolunteers();
  const allHistory = await volunteerHistoryModel.getAllHistory();
  // Map volunteerId to history
  const historyByVolunteer = {};
  for (const record of allHistory) {
    if (!historyByVolunteer[record.volunteerId]) historyByVolunteer[record.volunteerId] = [];
    historyByVolunteer[record.volunteerId].push(record);
  }
  // Attach participation history to each volunteer
  return volunteers.map(v => ({
    ...v,
    participation: historyByVolunteer[v.id] || []
  }));
}

// Fetch all events and their volunteer assignments
async function getEventDetails() {
  const events = await createEventModel.getAllEvents();
  const allHistory = await volunteerHistoryModel.getAllHistory();
  // Map eventId to volunteer assignments
  const assignmentsByEvent = {};
  for (const record of allHistory) {
    if (!assignmentsByEvent[record.eventId]) assignmentsByEvent[record.eventId] = [];
    assignmentsByEvent[record.eventId].push(record);
  }
  // Attach volunteer assignments to each event
  return events.map(e => ({
    ...e,
    assignments: assignmentsByEvent[e.id] || []
  }));
}

exports.generateVolunteerReport = async (req, res) => {
  if (!isAdmin(req)) return res.status(403).send('Forbidden: Admins only');
  const format = req.query.format || 'pdf';
  const data = await getVolunteerParticipation();
  if (format === 'csv') {
    // CSV: Volunteers and their participation
    const csvStringifier = createObjectCsvStringifier({
      header: [
        {id: 'id', title: 'Volunteer ID'},
        {id: 'username', title: 'Username'},
        {id: 'full_name', title: 'Full Name'},
        {id: 'skills', title: 'Skills'},
        {id: 'city', title: 'City'},
        {id: 'participation', title: 'Participation (Event Name | Date | Status)'}
      ]
    });
    const records = data.map(v => ({
      id: v.id,
      username: v.username,
      full_name: v.full_name,
      skills: Array.isArray(v.skills) ? v.skills.join('; ') : v.skills,
      city: v.city,
      participation: v.participation.map(p => `${p.eventName} | ${p.eventDate} | ${p.status}`).join(' || ')
    }));
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="volunteer-report.csv"');
    res.send(csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records));
  } else {
    // PDF: Volunteers and their participation
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="volunteer-report.pdf"');
    doc.pipe(res);
    doc.fontSize(18).text('Volunteer Participation Report', {align: 'center'});
    doc.moveDown();
    data.forEach(v => {
      doc.fontSize(12).text(`Volunteer: ${v.full_name} (${v.username}) | Skills: ${Array.isArray(v.skills) ? v.skills.join(', ') : v.skills}`);
      doc.text(`City: ${v.city}`);
      if (v.participation.length) {
        doc.text('Participation:');
        v.participation.forEach(p => {
          doc.text(`  - ${p.eventName} | ${p.eventDate} | ${p.status} | Hours: ${p.hoursServed || 0}`);
        });
      } else {
        doc.text('Participation: None');
      }
      doc.moveDown();
    });
    doc.end();
  }
};

exports.generateEventReport = async (req, res) => {
  if (!isAdmin(req)) return res.status(403).send('Forbidden: Admins only');
  const format = req.query.format || 'pdf';
  const data = await getEventDetails();
  if (format === 'csv') {
    // CSV: Events and their volunteer assignments
    const csvStringifier = createObjectCsvStringifier({
      header: [
        {id: 'id', title: 'Event ID'},
        {id: 'eventName', title: 'Event Name'},
        {id: 'date', title: 'Date'},
        {id: 'location', title: 'Location'},
        {id: 'urgency', title: 'Urgency'},
        {id: 'assignments', title: 'Volunteers (Name | Status | Hours)'}
      ]
    });
    const records = data.map(e => ({
      id: e.id,
      eventName: e.eventName,
      date: e.date,
      location: e.location,
      urgency: e.urgency,
      assignments: e.assignments.map(a => `${a.volunteerId} | ${a.status} | ${a.hoursServed || 0}`).join(' || ')
    }));
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="event-report.csv"');
    res.send(csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records));
  } else {
    // PDF: Events and their volunteer assignments
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="event-report.pdf"');
    doc.pipe(res);
    doc.fontSize(18).text('Event Details & Volunteer Assignments Report', {align: 'center'});
    doc.moveDown();
    data.forEach(e => {
      doc.fontSize(12).text(`Event: ${e.eventName} | Date: ${e.date} | Location: ${e.location} | Urgency: ${e.urgency}`);
      if (e.assignments.length) {
        doc.text('Volunteers:');
        e.assignments.forEach(a => {
          doc.text(`  - Volunteer ID: ${a.volunteerId} | Status: ${a.status} | Hours: ${a.hoursServed || 0}`);
        });
      } else {
        doc.text('Volunteers: None');
      }
      doc.moveDown();
    });
    doc.end();
  }
};
