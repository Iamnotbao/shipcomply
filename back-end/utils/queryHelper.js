const { Op } = require("sequelize");

class QueryHelper {
  constructor(queryString, fieldMap = {}) {
    this.queryString = queryString;
    this.fieldMap = fieldMap;
    this.whereMap = {};
  }

  filter() {
    const { search } = this.queryString;

    if (typeof search !== "object" || search === null) return this;

    for (const [modelName, fields] of Object.entries(this.fieldMap)) {
      const andConditions = [];

      Object.entries(search).forEach(([key, val]) => {
        if (val === null || val === undefined) return;
        if (typeof val === "string" && val.trim() === "") return;
        if (key === "factory_name" && modelName === "FACTORY") {
          const searchVal = String(val);
          andConditions.push({
            [Op.or]: [
              { factory_name_e: { [Op.like]: `%${searchVal}%` } },
              { factory_name_l: { [Op.like]: `%${searchVal}%` } },
              { factory_name_t: { [Op.like]: `%${searchVal}%` } },
            ],
          });
          return;
        }
        if (key === "program_name" && modelName === "PROGRAM") {
          const searchVal = String(val);
          andConditions.push({
            [Op.or]: [
              { program_name_e: { [Op.like]: `%${searchVal}%` } },
              { program_name_l: { [Op.like]: `%${searchVal}%` } },
              { program_name_t: { [Op.like]: `%${searchVal}%` } },
            ],
          });
          return;
        }
        if (key === "department_name" && modelName === "DEPARTMENTS") {
          const searchVal = String(val);
          andConditions.push({
            [Op.or]: [
              { department_name_e: { [Op.like]: `%${searchVal}%` } },
              { department_name_l: { [Op.like]: `%${searchVal}%` } },
              { department_name_t: { [Op.like]: `%${searchVal}%` } },
            ],
          });
          return;
        }
        if (key === "user_name" && modelName === "User") {
          const searchVal = String(val);
          andConditions.push({
            [Op.or]: [
              { user_name_e: { [Op.like]: `%${searchVal}%` } },
              { user_name_l: { [Op.like]: `%${searchVal}%` } },
              { user_name_t: { [Op.like]: `%${searchVal}%` } },
            ],
          });
          return;
        }
        if (key === "title_name" && modelName === "PROGRAM_FIELD_TITLE") {
          const searchVal = String(val);
          andConditions.push({
            [Op.or]: [
              { title_name_e: { [Op.like]: `%${searchVal}%` } },
              { title_name_l: { [Op.like]: `%${searchVal}%` } },
              { title_name_t: { [Op.like]: `%${searchVal}%` } },
            ],
          });
          return;
        }
        if (key === "category_name" && modelName === "BASIC_DATA_CATEGORY") {
          const searchVal = String(val);
          andConditions.push({
            [Op.or]: [
              { category_name_e: { [Op.like]: `%${searchVal}%` } },
              { category_name_l: { [Op.like]: `%${searchVal}%` } },
              { category_name_t: { [Op.like]: `%${searchVal}%` } },
            ],
          });
          return;
        }
        if (key === "name" && modelName === "BASIC_DATA") {
          const searchVal = String(val);
          andConditions.push({
            [Op.or]: [
              { name_e: { [Op.like]: `%${searchVal}%` } },
              { name_l: { [Op.like]: `%${searchVal}%` } },
              { name_t: { [Op.like]: `%${searchVal}%` } },
            ],
          });
          return;
        }
        if (fields.includes(key)) {
          if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
            console.log("Searching date:", key, val);
            const [year, month, day] = val.split("-").map(Number);
            const startDate = new Date(
              Date.UTC(year, month - 1, day, 0, 0, 0, 0)
            );
            const endDate = new Date(
              Date.UTC(year, month - 1, day, 23, 59, 59, 999)
            );

            andConditions.push({
              [key]: {
                [Op.between]: [startDate, endDate],
              },
            });
          }
          // Nếu là number
          else if (typeof val === "number") {
            andConditions.push({ [key]: val });
          }
          // Nếu là string thường
          else {
            andConditions.push({ [key]: { [Op.like]: `%${val}%` } });
          }
        }
      });

      if (andConditions.length > 0) {
        this.whereMap[modelName] = { [Op.and]: andConditions };
      }
    }

    return this;
  }
}

module.exports = QueryHelper;
