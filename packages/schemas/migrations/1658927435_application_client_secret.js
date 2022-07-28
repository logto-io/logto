module.exports.up = async (pool) => {
  await pool.query(`
    ALTER TABLE "applications"
    ADD COLUMN "secret" varchar(256)
  `);
};

module.exports.down = async () => {
  await pool.query(`
    ALTER TABLE "applications"
    DROP COLUMN "secret"
  `)
};
