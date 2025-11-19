import { User, Audit, Template, Location } from "../db/models/index.js";
import { Op } from "sequelize";

export const getDashboardStats = async (req, res) => {
  try {
    const [
      auditsCount,
      activeUsersCount,
      activeTemplatesCount,
      locationsCount,
    ] = await Promise.all([
      Audit.count(),
      User.count({
        where: { status: "active" },
      }),
      Template.count({
        where: { status: "active" },
      }),
      Location.count(),
    ]);

    res.json({
      auditsCount,
      usersCount: activeUsersCount,
      templatesCount: activeTemplatesCount,
      locationsCount,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};
