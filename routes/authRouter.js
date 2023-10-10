const express = require("express");
const router = express.Router();
const passport = require("passport");
require("dotenv").config();
//----------Route for /auth


//----------Route from Login page and CreateUser page -- Google OAuth2
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

//----------Route after google authenticates user -- Sends back to home page
router.get("/google/callback", passport.authenticate("google", { session: true } ), (req, res) => {
  console.log('from /auth/google/callback', req.user);
  res.redirect(`${process.env.CLIENT_URL}/UserAccount`,);
})

module.exports = router;
