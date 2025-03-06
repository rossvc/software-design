// Mock user profiles database
const userProfiles = [];

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
const updateUserProfile = (userId, profileData) => {
  validateUserProfile(profileData);

  const existingProfileIndex = userProfiles.findIndex(
    (p) => p.userId === userId
  );
  const profile = { userId, ...profileData };

  if (existingProfileIndex >= 0) {
    userProfiles[existingProfileIndex] = profile;
  } else {
    userProfiles.push(profile);
  }

  return profile;
};

// Get user profile
const getUserProfile = (userId) => {
  return userProfiles.find((p) => p.userId === userId);
};

module.exports = {
  validateUserProfile,
  updateUserProfile,
  getUserProfile,
};
