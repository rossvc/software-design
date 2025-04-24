const db = require("../utils/db");

// Validate user profile data
const validateUserProfile = (profile) => {
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

    const profiles = await db.query(
      "SELECT * FROM UserProfile WHERE user_id = ?",
      [userId]
    );

    const fullName = `${profileData.name} ${profileData.lastName}`;
    const skills = JSON.stringify(profileData.skills);
    const preferences = JSON.stringify(profileData.preferences || "");
    const availability = JSON.stringify(profileData.availability || []);

    if (profiles.length > 0) {
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

// Get user profile (updated with JOIN to States)
const getUserProfile = async (userId) => {
  try {
    const profiles = await db.query(
      `SELECT 
         u.user_id,
         u.full_name,
         u.address,
         u.city,
         s.name AS state_name,
         u.zip_code,
         u.skills,
         u.preferences,
         u.availability
       FROM 
         UserProfile u
       JOIN 
         States s 
       ON 
         u.state = s.code
       WHERE 
         u.user_id = ?`,
      [userId]
    );

    if (profiles.length === 0) {
      return null;
    }

    const profile = profiles[0];
    const fullNameParts = profile.full_name.split(" ");
    const lastName = fullNameParts.pop();
    const name = fullNameParts.join(" ");

    // Direct extraction for skills from the database format
    let skillsArray = [];
    if (profile.skills) {
      // Check if skills is already an array (parsed JSON)
      if (Array.isArray(profile.skills)) {
        skillsArray = profile.skills;
      } else if (typeof profile.skills === 'string') {
        try {
          // Try to parse it as JSON first
          const parsed = JSON.parse(profile.skills);
          if (Array.isArray(parsed)) {
            skillsArray = parsed;
          } else {
            // Handle string formats
            // Check if it's the format like: ["teamwork"] or ["skill1", "skill2"]
            const skillMatches = profile.skills.match(/"([^"]+)"/g);
            if (skillMatches && skillMatches.length > 0) {
              // Extract the skills from the matches
              skillsArray = skillMatches.map(match => match.replace(/"/g, ''));
            } else if (profile.skills.includes(',')) {
              // Handle comma-separated format
              skillsArray = profile.skills.split(',').map(s => s.trim().replace(/"/g, ''));
            } else if (profile.skills.trim() !== '') {
              // Single skill without quotes
              skillsArray = [profile.skills.trim().replace(/"/g, '')];
            }
          }
        } catch (e) {
          // If JSON parsing fails, handle as string
          if (profile.skills.includes(',')) {
            // Handle comma-separated format
            skillsArray = profile.skills.split(',').map(s => s.trim().replace(/"/g, ''));
          } else if (profile.skills.trim() !== '') {
            // Single skill without quotes
            skillsArray = [profile.skills.trim().replace(/"/g, '')];
          }
        }
      } else if (typeof profile.skills === 'object') {
        // Handle case where skills might be a non-array object
        skillsArray = Object.values(profile.skills);
      }
      console.log(`Extracted skills for user_id ${profile.user_id}:`, skillsArray);
    }

    // Direct handling for preferences as a string
    let preferences = "";
    if (profile.preferences) {
      // If it's wrapped in quotes like "preference text"
      if (profile.preferences.startsWith('"') && profile.preferences.endsWith('"')) {
        preferences = profile.preferences.substring(1, profile.preferences.length - 1);
      } else {
        preferences = profile.preferences;
      }
      // Remove any escaped quotes
      preferences = preferences.replace(/\\"|\"/g, '');
      console.log(`Extracted preferences for user_id ${profile.user_id}:`, preferences);
    }
    
    // Create result object
    const result = {
      userId: profile.user_id,
      name,
      lastName,
      address: profile.address,
      city: profile.city,
      state: profile.state_name, // Full state name from States table
      zipCode: profile.zip_code,
      skills: skillsArray, // Extracted skills array
      preferences: preferences, // Preferences as string
      availability: [] // Default empty array for availability (will be populated below)
    };
    
    // Direct extraction for availability dates from the database format
    if (profile.availability) {
      // Check if availability is already an array (parsed JSON)
      if (Array.isArray(profile.availability)) {
        result.availability = profile.availability;
      } else if (typeof profile.availability === 'string') {
        try {
          // Try to parse it as JSON first
          const parsed = JSON.parse(profile.availability);
          if (Array.isArray(parsed)) {
            result.availability = parsed;
          } else {
            // Handle string formats
            // Check if it's the format like: ["2025-04-24", "2025-04-25", "2025-04-26"]
            const dateMatches = profile.availability.match(/"([^"]+)"/g);
            if (dateMatches && dateMatches.length > 0) {
              // Extract the dates from the matches
              result.availability = dateMatches.map(match => match.replace(/"/g, ''));
            } else if (profile.availability.includes(',')) {
              // Handle comma-separated format
              result.availability = profile.availability.split(',').map(d => d.trim().replace(/"/g, ''));
            } else if (profile.availability.trim() !== '') {
              // Single date without quotes
              result.availability = [profile.availability.trim().replace(/"/g, '')];
            }
          }
        } catch (e) {
          // If JSON parsing fails, handle as string
          if (profile.availability.includes(',')) {
            // Handle comma-separated format
            result.availability = profile.availability.split(',').map(d => d.trim().replace(/"/g, ''));
          } else if (profile.availability.trim() !== '') {
            // Single date without quotes
            result.availability = [profile.availability.trim().replace(/"/g, '')];
          }
        }
      } else if (typeof profile.availability === 'object') {
        // Handle case where availability might be a non-array object
        result.availability = Object.values(profile.availability);
      }
      console.log(`Extracted availability for user_id ${profile.user_id}:`, result.availability);
    }
    
    return result;
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
