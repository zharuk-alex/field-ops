module.exports = {
  development: {
    username: "sasha",
    password: "",
    database: "fieldops",
    host: "127.0.0.1",
    dialect: "postgres",
  },
  production: {
    use_env_variable: process.env.DB_URL ? "DB_URL" : "DATABASE_URL",
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
  test: {
    use_env_variable: "DB_URL",
    dialect: "postgres",
  },
};
