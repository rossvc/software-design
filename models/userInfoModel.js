const db = require("../utils/db");

// Validate user profile data
const validateUserProfile = (profile) => {
  // Required fields validation
  const requiredFields = [
    "name",
    "lastName",
    "address",
    "city",
    "state",
    "zipCode",
    "skills",
  ];
  for (const field of requiredFields) {
    if (!profile[field]) {
      throw new Error(`${field} is required`);
    }
  }

  // Field type validation
  if (typeof profile.name !== "string")
    throw new Error("Name must be a string");
  if (typeof profile.lastName !== "string")
    throw new Error("Last name must be a string");
  if (typeof profile.address !== "string")
    throw new Error("Address must be a string");
  if (typeof profile.city !== "string")
    throw new Error("City must be a string");
  if (typeof profile.state !== "string")
    throw new Error("State must be a string");
  if (typeof profile.zipCode !== "string")
    throw new Error("Zip code must be a string");
  if (!Array.isArray(profile.skills))
    throw new Error("Skills must be an array");

  // Field length validation
  if (profile.name.length < 2)
    throw new Error("Name must be at least 2 characters");
  if (profile.lastName.length < 2)
    throw new Error("Last name must be at least 2 characters");
  if (profile.address.length < 5)
    throw new Error("Address must be at least 5 characters");
  if (profile.city.length < 2)
    throw new Error("City must be at least 2 characters");
  if (profile.state.length !== 2) throw new Error("State must be 2 characters");
  if (profile.zipCode.length !== 5)
    throw new Error("Zip code must be 5 characters");
  if (profile.skills.length === 0)
    throw new Error("At least one skill is required");
};

// Create or update user profile
const updateUserProfile = async (userId, profileData) => {
  try {
    validateUserProfile(profileData);

    // Check if profile exists
    const profiles = await db.query(
      "SELECT * FROM UserProfile WHERE user_id = ?",
      [userId]
    );

    const fullName = `${profileData.name} ${profileData.lastName}`;
    const skills = JSON.stringify(profileData.skills);
    const preferences = JSON.stringify(profileData.preferences || {});
    const availability = profileData.availability ? 1 : 0;

    if (profiles.length > 0) {
      // Update existing profile
      await db.query(
        `UPDATE UserProfile 
         SET full_name = ?, address = ?, city = ?, state = ?, 
             zip_code = ?, skills = ?, preferences = ?, availability = ? 
         WHERE user_id = ?`,
        [
          fullName,
          profileData.address,
          profileData.city,
          profileData.state,
          profileData.zipCode,
          skills,
          preferences,
          availability,
          userId,
        ]
      );
    } else {
      // Create new profile
      await db.query(
        `INSERT INTO UserProfile 
         (user_id, full_name, address, city, state, zip_code, skills, preferences, availability) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          fullName,
          profileData.address,
          profileData.city,
          profileData.state,
          profileData.zipCode,
          skills,
          preferences,
          availability,
        ]
      );
    }

    return {
      userId,
      ...profileData,
    };
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// Get user profile
const getUserProfile = async (userId) => {
  try {
    const profiles = await db.query(
      "SELECT * FROM UserProfile WHERE user_id = ?",
      [userId]
    );

    if (profiles.length === 0) {
      return null;
    }

    const profile = profiles[0];
    const fullNameParts = profile.full_name.split(" ");
    const lastName = fullNameParts.pop();
    const name = fullNameParts.join(" ");

    return {
      userId: profile.user_id,
      name,
      lastName,
      address: profile.address,
      city: profile.city,
      state: profile.state,
      zipCode: profile.zip_code,
      skills: profile.skills,
      preferences: profile.preferences,
      availability: profile.availability === 1,
    };
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

module.exports = {
  validateUserProfile,
  updateUserProfile,
  getUserProfile,
};
