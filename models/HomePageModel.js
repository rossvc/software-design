const homepageContent = {
  title: "Welcome to Volunteer Center!",
  description: "Find an event near you",
  buttons: {
    signUp: "/Registration.html",
    logIn: "/Signin.html",
  },
};

module.exports = {
  getHomepageContent: () => homepageContent,
};
