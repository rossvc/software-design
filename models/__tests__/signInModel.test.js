const { findUser } = require("../signInModel");

describe("findUser", () => {
  test("should return user object if username and password match", () => {
    const user = findUser("admin", "admin123");
    expect(user).toEqual({
      id: 1,
      username: "admin",
      password: "admin123",
      role: "admin",
    });
  });

  test("should return undefined if username does not match", () => {
    const user = findUser("nonexistent", "admin123");
    expect(user).toBeUndefined();
  });

  test("should return undefined if password does not match", () => {
    const user = findUser("admin", "wrongpassword");
    expect(user).toBeUndefined();
  });

  test("should return user object if username and password match for volunteer", () => {
    const user = findUser("volunteer", "volunteer123");
    expect(user).toEqual({
      id: 2,
      username: "volunteer",
      password: "volunteer123",
      role: "volunteer",
    });
  });

  test("should return undefined if both username and password do not match", () => {
    const user = findUser("nonexistent", "wrongpassword");
    expect(user).toBeUndefined();
  });
});
