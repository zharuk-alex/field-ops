module.exports = {
  development: {
    username: "sasha",
    password: "",
    database: "fieldops",
    host: "127.0.0.1",
    dialect: "postgres",
  },
  production: {
    url: process.env.DB_URL,
    dialect: "postgres",
  },
  test: {
    url: process.env.DB_URL,
    dialect: "postgres",
  },
};
