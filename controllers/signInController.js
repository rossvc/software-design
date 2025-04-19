const signInModel = require("../models/signInModel");

exports.signIn = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await signInModel.findUser(username, password);

    if (user) {
      req.session.user = {
        id: user.id,
        username: user.username,
        role: user.role,
      };

      res.status(200).json({
        message: "Login successful",
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      });
    } else {
      res.status(401).json({ message: "Invalid username or password" });
    }
  } catch (error) {
    console.error("Sign in error:", error);
    res.status(500).json({ message: "An error occurred during sign in" });
  }
};

exports.signOut = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to logout" });
    }
    res.status(200).json({ message: "Logout successful" });
  });
};
