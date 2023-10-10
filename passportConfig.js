const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
require("dotenv").config();
const pool = require("./db/index.js");

const {
  checkUsername,
  matchPassword,
} = require("./middlewares/helperFunctions.js");

passport.use(
  "local-login",
  new localStrategy(
    {
      usernameField: "username",
      passwordField: "password",
    },
    async (username, password, done) => {
      let user = {};
      try {
        const query =
          "SELECT user_id, username, password, img FROM users WHERE username = $1";
        const values = [username];
        const result = await pool.query(query, values);

        const userData = result.rows[0];
        if (!userData) {
          return done(null, false);
        }

        const isMatch = await matchPassword(password, userData.password);
        // console.log(isMatch);
        if (!isMatch) {
          return done(null, false);
        }
        user = {
          id: userData.user_id,
          username: userData.username,
          img: userData.img,
          isLoggedIn: true,
        };
        console.log(user);
        return done(null, user);
      } catch (error) {
        console.error(error);
        return done(error, false);
      }
    }
  )
);

passport.serializeUser((userData, done) => {
  console.log(userData.user_id);
  done(null, userData);
});
passport.deserializeUser(async (id, done) => {
  done(null, id);
});

// module.exports = function (passport) {
//   passport.use(
//     "local-login",
//     new localStrategy(
//       {
//         usernameField: "username",
//         passwordField: "password",
//       },
//       async (username, password, done) => {
//         try {
//           const userData = await checkUsername(username);
//           if (!userData)
//             return done(null, false, {
//               message: "Incorrect username and/or password.",
//             });
//           const isMatch = await matchPassword(password, userData.password);
//           if (!isMatch)
//             return done(null, false, {
//               message: "Incorrect username and/or password.",
//             });
//           return done(null, userData.username);
//         } catch (error) {
//           return done(error, false);
//         }
//       }
//     )
//   );

//   passport.serializeUser((userData, done) => {
//     done(null, userData.user_id);
//   });
//   passport.deserializeUser(async (id, done) => {
//     const userData = await db.oneOrNone("SELECT * FROM users WHERE user_id = $1", [
//       id,
//     ]);
//     if (userData) {
//       return done(null, userData[0]);
//     } else {
//       return done(null, false);
//     }
//   });
// };

// passport.use(
//   "local-signup",
//   new localStrategy(
//     {
//       usernameField: "username",
//       passwordField: "password",
//     },
//     async (username, password, done) => {
//       try {
//         const usernameExists = await checkUsername(username);
//         if (usernameExists) {
//           return done(null, false);
//         }
//         const newUser = await createNewUser(
//           userData.username,
//           userData.first_name,
//           userData.last_name,
//           userData.email,
//           userData.dob,
//           userData.password
//         );
//         return done(null, newUser);
//       } catch (error) {
//         return done(error);
//       }
//     }
//   )
// );
