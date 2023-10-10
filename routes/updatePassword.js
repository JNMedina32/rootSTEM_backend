const express = require("express");
const router = express.Router();
const db = require("../db/index.js");

router.post("/", async (req, res) => {
  const { oldPassword, newPassword, username } = req.body;
  // console.log("server post:", req.body);
  try{
    let user = await db.oneOrNone(
      `
      UPDATE users
      SET password = crypt($1, gen_salt('bf'))
      WHERE username = $2 
      AND crypt($3, password) = password
      RETURNING username
      `,
      [newPassword, username, oldPassword]
    );
    if(user){
      const isLoggedIn = true;
      const successfulPassword = true;
      user = {...user, isLoggedIn, successfulPassword};
      res.send(user);
    } else {
      res.status(401).send({ error: "Incorrect password. Try Again." })
    }
  }catch (error){
    console.error(error);
    res.status(400).send({ error: "Error with request"})
  }
});

module.exports = router;