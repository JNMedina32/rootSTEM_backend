const express = require("express");
const router = express.Router();


const pool = require("../db/index.js");

const bcrypt = require("bcryptjs");

async function checkUsernameMiddleware(req, res, next){
  const { username } = req.body;
  try {
    const isUnique = await pool.query(
      `
      SELECT *
      FROM users
      WHERE username = $1;
      `,
      [username]
    );
    if (isUnique.rows.length === 0) {
      next();
    } else {
      res.json({ error: "Username taken." });
    }
  } catch (error) {
    console.error(error);
  }
};


// ----------Create New User
router.get("/", (req, res) => {
  res.render("createUser");
});



router.post("/", checkUsernameMiddleware, async (req, res) => {
  const { username, first_name, last_name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    let user = await pool.query(
      `
      INSERT INTO users (username, first_name, last_name, email, password)
      VALUES
      ($1, $2, $3, $4, $5)
      RETURNING user_id, username, img;
      `,
      [username, first_name, last_name, email, hashedPassword]
    );
    if (user.rows.length > 0) {
      //console.log(user)

      const isLoggedIn = true;
      user = { ...user, isLoggedIn };
      res.send(user);
      // res.redirect("/");
    } else {
      res.status(400).send({ error: "Unexpected Error." });
    }
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
