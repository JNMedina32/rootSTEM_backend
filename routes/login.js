const express = require("express");
const router = express.Router();
const oAuthRouter = require("./authRouter.js");
const passport = require("passport");
require("../passportConfig.js");

//----------Router for /login



router.get(
  "/oauth2/google",
  passport.authenticate("google", {
    scope: ["https://www.googleapis.com/auth/youtube.force-ssl", "profile", "email"],
  })
);

router.post("/", passport.authenticate("local-login"), (req, res) => {
  const user = req.user;
  //console.log(user);
  res.send(user);
});

//---------Router to 
router.use("/oauth2", oAuthRouter);

module.exports = router;

//  ----------------Authenticates user from db, Creates a Session.user if true, send back user;
// router.post("/", async (req, res) => {
//   const { username, password } = req.body;
//   //console.log(username);
//   try {
//     let user = await db.oneOrNone(
//       `
//       SELECT username
//       FROM users
//       WHERE username = $1
//       AND crypt($2, password) = password;
//     `,
//       [username, password]
//     );
//     if (user) {

//       const isLoggedIn = true;
//       user = {...user, isLoggedIn};
//       //console.log(user);
//       res.send(user);
//     } else {
//       res.status(401).send({ error: "Incorrect username and/or password" });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({ error: "An error occurred" });
//   }
// });

// router.get("/", (req, res) => {
//   res.render("login");
// });
