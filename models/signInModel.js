const db = require("../utils/db");
const bcrypt = require("bcrypt");

const findUser = async (username, password) => {
  try {
    // Get user from database
    const users = await db.query(
      "SELECT * FROM UserCredentials WHERE username = ?",
      [username]
    );

    if (users.length === 0) {
      return null;
    }

    const user = users[0];

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      return {
        id: user.id,
        username: user.username,
        role: user.role,
      };
    }

    return null;
  } catch (error) {
    console.error("Error finding user:", error);
    throw error;
  }
};

module.exports = {
  findUser,
};
