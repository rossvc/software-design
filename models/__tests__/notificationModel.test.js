const {
  validateNotification,
  addNotification,
  updateNotification,
  deleteNotification,
  markAllAsRead,
  getNotificationById,
} = require("../notificationModel");

describe("Notification Model", () => {
  const validNotification = {
    type: "assignment",
    title: "New Assignment",
    message: "You have been assigned to a new volunteer event",
    read: false,
  };

  describe("Notification Validation", () => {
    test("validates required fields", () => {
      const invalidNotification = { ...validNotification };
      delete invalidNotification.type;
      expect(() => validateNotification(invalidNotification)).toThrow(
        "type is required"
      );
    });

    test("validates field types", () => {
      const invalidNotification = {
        ...validNotification,
        type: 123,
      };
      expect(() => validateNotification(invalidNotification)).toThrow(
        "Type must be a string"
      );

      const invalidRead = {
        ...validNotification,
        read: "true",
      };
      expect(() => validateNotification(invalidRead)).toThrow(
        "Read status must be a boolean"
      );
    });

    test("validates field lengths", () => {
      const shortTitle = {
        ...validNotification,
        title: "Ab",
      };
      expect(() => validateNotification(shortTitle)).toThrow(
        "Title must be at least 3 characters"
      );

      const shortMessage = {
        ...validNotification,
        message: "Too short",
      };
      expect(() => validateNotification(shortMessage)).toThrow(
        "Message must be at least 10 characters"
      );
    });

    test("validates notification type", () => {
      const invalidType = {
        ...validNotification,
        type: "invalid",
      };
      expect(() => validateNotification(invalidType)).toThrow(
        "Type must be assignment, update, or reminder"
      );
    });

    test("accepts valid notification", () => {
      expect(() => validateNotification(validNotification)).not.toThrow();
    });
  });

  describe("Notification Management", () => {
    test("adds new notification", () => {
      const notification = addNotification(validNotification);
      expect(notification).toEqual({
        id: expect.any(Number),
        ...validNotification,
        createdAt: expect.any(String),
      });
    });

    test("updates existing notification", () => {
      const notification = addNotification(validNotification);
      const updatedFields = {
        title: "Updated Title",
        message: "This is an updated notification message",
      };

      const updated = updateNotification(notification.id, updatedFields);
      expect(updated).toEqual({
        ...notification,
        ...updatedFields,
      });
    });

    test("fails to update non-existent notification", () => {
      const result = updateNotification(999, { title: "Test" });
      expect(result).toBeNull();
    });

    test("deletes notification", () => {
      const notification = addNotification(validNotification);
      const deleted = deleteNotification(notification.id);
      expect(deleted).toEqual(notification);

      const notFound = getNotificationById(notification.id);
      expect(notFound).toBeUndefined();
    });

    test("fails to delete non-existent notification", () => {
      const result = deleteNotification(999);
      expect(result).toBeNull();
    });

    test("marks all notifications as read", () => {
      // Add a few unread notifications
      addNotification({ ...validNotification, read: false });
      addNotification({ ...validNotification, read: false });

      const result = markAllAsRead();
      expect(result.every((n) => n.read)).toBe(true);
    });
  });
});
