import sequelize from "../db/Sequelize.js";
import { Company } from "../db/models/index.js";

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection successful.");

    const name = "Demo Company";
    const timezone = "Europe/Kiev";
    const locale = "uk";

    const [company, created] = await Company.findOrCreate({
      where: { name },
      defaults: { timezone, locale },
    });

    if (created) {
      console.log("Company created:");
    } else {
      console.log("Company already exists:", {
        id: company.id,
        name: company.name,
      });
    }

    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err.message || err);
    process.exit(1);
  }
})();
