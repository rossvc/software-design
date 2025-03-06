const { registerUser, validateUser } = require("../registrationModel");

describe("Registration Model", () => {
  describe("Input Validation", () => {
    test("validates required fields", () => {
      expect(() => validateUser()).toThrow("Username is required");
      expect(() => validateUser("username")).toThrow("Password is required");
    });

    test("validates field types", () => {
      expect(() => validateUser(123, "password")).toThrow(
        "Username must be a string"
      );
      expect(() => validateUser("username", 123)).toThrow(
        "Password must be a string"
      );
    });

    test("validates field lengths", () => {
      expect(() => validateUser("ab", "password")).toThrow(
        "Username must be at least 3 characters"
      );
      expect(() => validateUser("username", "12345")).toThrow(
        "Password must be at least 6 characters"
      );
    });

    test("accepts valid input", () => {
      expect(() => validateUser("username", "password123")).not.toThrow();
    });
  });

  describe("User Registration", () => {
    test("registers new user successfully", () => {
      const user = registerUser("testuser", "password123");
      expect(user).toEqual({
        id: expect.any(Number),
        username: "testuser",
        password: "password123",
      });
    });

    test("prevents duplicate usernames", () => {
      registerUser("uniqueuser", "password123");
      expect(() => registerUser("uniqueuser", "newpassword")).toThrow(
        "Username already exists!"
      );
    });

    test("validates input during registration", () => {
      expect(() => registerUser("ab", "short")).toThrow(
        "Username must be at least 3 characters"
      );
    });
  });
});
