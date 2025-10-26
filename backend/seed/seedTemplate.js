import "dotenv/config.js";
import sequelize from "../db/Sequelize.js";
import "../db/models/index.js";
import { Template, TemplateQuestion, Company } from "../db/models/index.js";

(async () => {
  try {
    await sequelize.authenticate();
    console.log("DB connected");

    let companyId = process.env.SEED_COMPANY_ID;
    let company;

    if (companyId) {
      company = await Company.findByPk(companyId);
      if (!company) {
        throw new Error(`Company not found by SEED_COMPANY_ID=${companyId}`);
      }
    } else {
      [company] = await Company.findOrCreate({
        where: { name: "Demo Company" },
        defaults: {
          name: "Demo Company",
          timezone: "Europe/Kyiv",
          locale: "uk",
        },
      });
      companyId = company.id;
    }

    const templatePayload = {
      name: "Exsample Template v1",
      description: "Базовий шаблон аудиту магазину",
      companyId,
    };

    const questionPayload = [
      {
        questionText: "Чи відкрився магазин вчасно?",
        type: "boolean",
        required: true,
        order: 1,
      },
      {
        questionText: "Оцініть чистоту торгового залу",
        type: "rating",
        choices: JSON.stringify([1, 2, 3, 4, 5]),
        required: true,
        order: 2,
      },
      {
        questionText: "Зробіть фото вітрини",
        type: "photo",
        required: false,
        order: 3,
      },
      {
        questionText: "Коментарі аудитора",
        type: "text",
        required: false,
        order: 4,
      },
    ];

    await sequelize.transaction(async (t) => {
      const [tmpl] = await Template.findOrCreate({
        where: { name: templatePayload.name, companyId },
        defaults: templatePayload,
        transaction: t,
      });

      await tmpl.update(templatePayload, { transaction: t });

      await TemplateQuestion.destroy({
        where: { templateId: tmpl.id },
        transaction: t,
      });

      const rows = questionPayload.map((q) => ({
        ...q,
        templateId: tmpl.id,
      }));

      await TemplateQuestion.bulkCreate(rows, { transaction: t });

      console.log(
        `Seeded template "${tmpl.name}" (${tmpl.id}) with ${rows.length} questions for company ${company.name}`
      );
    });

    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  }
})();
