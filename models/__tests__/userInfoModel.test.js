const {
  validateUserProfile,
  updateUserProfile,
  getUserProfile,
} = require("../userInfoModel");

describe("User Info Model", () => {
  const validProfile = {
    name: "John",
    lastName: "Doe",
    address: "123 Main St",
    city: "Houston",
    state: "TX",
    zipCode: "77004",
    skills: ["Programming", "Teaching"],
  };

  describe("Profile Validation", () => {
    test("validates required fields", () => {
      const invalidProfile = { ...validProfile };
      delete invalidProfile.name;
      expect(() => validateUserProfile(invalidProfile)).toThrow(
        "name is required"
      );
    });

    test("validates field types", () => {
      const invalidProfile = {
        ...validProfile,
        name: 123, // Should be string
      };
      expect(() => validateUserProfile(invalidProfile)).toThrow(
        "Name must be a string"
      );
    });

    test("validates field lengths", () => {
      const invalidProfile = {
        ...validProfile,
        name: "J", // Too short
        state: "Texas", // Should be 2 chars
        zipCode: "1234", // Should be 5 chars
      };
      expect(() => validateUserProfile(invalidProfile)).toThrow(
        "Name must be at least 2 characters"
      );

      const invalidState = { ...validProfile, state: "USA" };
      expect(() => validateUserProfile(invalidState)).toThrow(
        "State must be 2 characters"
      );

      const invalidZip = { ...validProfile, zipCode: "123456" };
      expect(() => validateUserProfile(invalidZip)).toThrow(
        "Zip code must be 5 characters"
      );
    });

    test("validates skills array", () => {
      const invalidProfile = { ...validProfile, skills: "Programming" };
      expect(() => validateUserProfile(invalidProfile)).toThrow(
        "Skills must be an array"
      );

      const emptySkills = { ...validProfile, skills: [] };
      expect(() => validateUserProfile(emptySkills)).toThrow(
        "At least one skill is required"
      );
    });

    test("accepts valid profile", () => {
      expect(() => validateUserProfile(validProfile)).not.toThrow();
    });
  });

  describe("Profile Management", () => {
    test("creates new user profile", () => {
      const userId = 1;
      const profile = updateUserProfile(userId, validProfile);
      expect(profile).toEqual({
        userId,
        ...validProfile,
      });
    });

    test("updates existing user profile", () => {
      const userId = 1;
      const updatedProfile = {
        ...validProfile,
        name: "Jane",
        skills: ["Teaching", "Leadership"],
      };

      const profile = updateUserProfile(userId, updatedProfile);
      expect(profile).toEqual({
        userId,
        ...updatedProfile,
      });
    });

    test("retrieves user profile", () => {
      const userId = 2;
      updateUserProfile(userId, validProfile);
      const profile = getUserProfile(userId);
      expect(profile).toEqual({
        userId,
        ...validProfile,
      });
    });

    test("returns undefined for non-existent profile", () => {
      const profile = getUserProfile(999);
      expect(profile).toBeUndefined();
    });
  });
});
