const users = [
  { id: 1, username: "admin", password: "admin123", role: "admin" },
  { id: 2, username: "volunteer", password: "volunteer123", role: "volunteer" },
];

exports.signIn = (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

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
};

exports.signOut = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to logout" });
    }
    res.status(200).json({ message: "Logout successful" });
  });
};
