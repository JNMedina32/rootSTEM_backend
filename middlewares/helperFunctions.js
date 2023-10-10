const pool = require("../db/index.js");
const db = require("../db/index.js");
const bcrypt = require("bcryptjs");
require("dotenv").config();


// const uniqueEmailCheck = async (email) => {
//   try {
//     const isUnique = await db.oneOrNone(
//       `
//       SELECT email
//       FROM users
//       WHERE email = $1;
//       `,
//       [email]
//     );
//     if (!isUnique) {
//       return false;
//     } else {
//       return isUnique.rows[0];
//     }
//   } catch (error) {
//     console.error(error);
//   }
// };

// const createNewUser = async (
//   username,
//   first_name,
//   last_name,
//   email,
//   password,
//   dob
// ) => {
//   const hashedPassword = await bcrypt.hash(password, 10);

//   try {
//     const query =
//       "INSERT INTO users (username, first_name, last_name, email, dob, password) VALUES ($1, $2, $3, $4, $5, $6) RETURNING username";
//     const values = [
//       username,
//       first_name,
//       last_name,
//       email,
//       dob,
//       hashedPassword,
//     ];
//   } catch (error) {
//     console.error(error);
//   }
// };

// const matchPassword = async (password, hashedPassword) => {
//   const match = await bcrypt.compare(password, hashedPassword);
//   return match;
// };

async function updateReqUser(user_id){
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const query = await client.query(
      "SELECT * FROM user_app_settings WHERE user_id = $1",
      [user_id]
    );
    const { 
      mathematics,
      material_science,
      computer_science,
      miscellaneous,
      engineering,
      technology,
      physics,
      geography,
      biology,
      chemistry,
      electronics,
      astronomy,
      science,
      roots_learner,
    } = query.rows[0];
    const preferences = {
      mathematics,
      material_science,
      computer_science,
      miscellaneous,
      engineering,
      technology,
      physics,
      geography,
      biology,
      chemistry,
      electronics,
      astronomy,
      science,
    };
    const learner = roots_learner;
    const query2 = await client.query(
      "SELECT username, img FROM users WHERE user_id = $1",
      [user_id]
    );
    const { username, img } = query2.rows[0];
    const user = {
      user_id,
      username,
      img,
      isLoggedIn: true,
      preferences,
      learner,
    };
    await client.query("COMMIT");
    return user;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    return error;
  } finally {
    client.release();
  }
};

module.exports = updateReqUser;