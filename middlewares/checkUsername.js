const pool = require("../db/index.js");



export async function checkUsername(username){
  try {
    const isUnique = await pool.query(
      `
      SELECT *
      FROM users
      WHERE username = $1;
      `,
      [username]
    );
    if (isUnique.rows.length > 0) {
      return isUnique;
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
  }
};
