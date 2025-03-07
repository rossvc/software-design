const users = [
  { id: 1, username: "admin", password: "admin123", role: "admin" },
  { id: 2, username: "volunteer", password: "volunteer123", role: "volunteer" },
];

const findUser = (username, password) => {
  return users.find((u) => u.username === username && u.password === password);
};

module.exports = {
  findUser,
};
