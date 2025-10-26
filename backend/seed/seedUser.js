import sequelize from "../db/Sequelize.js";
import User from "../db/models/User.js";
import bcrypt from "bcrypt";
import { config as dotenv } from "dotenv";

dotenv({
  path:
    process.env.DOTENV_PATH || new URL("../../env/.env.local", import.meta.url),
});

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    const email = process.env.ADMIN_USER;
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) {
      process.exit(1);
    }

    const hash = await bcrypt.hash(password, 10);

    const [user, created] = await User.findOrCreate({
      where: { email },
      defaults: { password: hash, verify: true, role: "admin" },
    });

    console.log(created ? "User created" : "User exists", user.email);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
