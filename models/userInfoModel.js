// Mock User Data
const userInfo = {
  name: "Alejandro",
  lastName: "Avila",
  address: "4302 University Dr.",
  city: "Houston",
  state: "Texas",
  zipCode: "77004",
  skills: ["Event Planning", "Fundraising", "Community Outreach"],
  userRole: "Volunteer",
  availability: "04/15/2025",
};

// Mock Notifications
const notifications = [
  "Beach Cleanup starts in 3 days! Don't forget to bring gloves and water.",
  "New volunteer opportunity: Community Garden event this Saturday!",
  "Reminder: Fundraising event meeting tomorrow at 5 PM.",
];

module.exports = {
  getUserInfo: () => userInfo,
  getUserNotifications: () => notifications,
};
