const { db, TABLES } = require('knex-conn');
const daysjs = require('dayjs');

const findById = async ({ id }) => {
  const result = await db
    .select()
    .from(TABLES.employeePositionSets)
    .where({ id });
  return result[0];
};

const updateStatus = async ({ status, id, id_imported_file }) => {
  const updatedAt = daysjs().format('YYYY-MM-DD');
  return db
    .update({
      status,
      updated_at: updatedAt,
      prev_status: status,
      id_imported_file
    })
    .from(TABLES.employeePositionSets)
    .where({ id });
};

module.exports = {
  findById,
  updateStatus
};
