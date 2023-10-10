const express = require("express");
const router = express.Router();
const db = require("../db/index.js");
const isAuth = require("../middlewares/isAuth.js");


router.post("/", isAuth,  async (req, res) => {
  const { newUsername, username } = req.body;
  // const username = req.session.user
  // console.log(username, newUsername);

  try {
    let user = await db.one(
      `
      UPDATE users
      SET username = $1
      WHERE username = $2
      RETURNING username 
      `,
      [newUsername, username]
    );
    if (user) {
      const isLoggedIn = true;
      const successfulUsername = true;
      user = { ...user, isLoggedIn, successfulUsername };
      res.send(user);
    } else {
      res.status(401).send({ error: "Router: Username Taken" });
    }
  } catch (error) {
    console.error(error);
    res.status(400).send({ error: "Error with request" });
  }
});

module.exports = router;
