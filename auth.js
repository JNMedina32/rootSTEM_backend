const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
require("dotenv").config();
const pool = require("./db/index.js");
const updateReqUser = require("./middlewares/helperFunctions.js");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      const userData = profile._json;
      //console.log("from passport accessToken:", accessToken, refreshToken)
      console.log("from passport userData:", userData);
      let user = {};
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const currentUserQuery = await client.query(
          "SELECT * FROM users WHERE google_id = $1",
          [userData.sub]
        );
        //console.log("from passport currentUserQuery:", currentUserQuery.rows[0]);
        if (currentUserQuery.rows.length > 0) {
          const db_user_data = await client.query(
            "UPDATE users SET access_token = $1 WHERE google_id = $2 RETURNING user_id, username, img, access_token",
            [accessToken, userData.sub]
          );
          user = {
            user_id: db_user_data.rows[0].user_id,
            isLoggedIn: true,
            username: db_user_data.rows[0].username,
            img: db_user_data.rows[0].img,
            accessToken: db_user_data.rows[0].access_token,
          };
          const userSettings = await client.query(
            "SELECT * FROM user_app_settings WHERE user_id = $1",
            [user.user_id]
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
          } = userSettings.rows[0];
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
          user = { ...user, preferences, learner };
          console.log("from passport if currentUser", user);
          // console.log(currentUserQuery.rows[0])
        } else {
          const db_user_data = await client.query(
            "INSERT INTO users (username, first_name, last_name, email, img, access_token, google_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING user_id, username, img, access_token",
            [
              userData.name,
              userData.given_name,
              userData.family_name,
              userData.email,
              userData.picture,
              accessToken,
              userData.sub,
            ]
          );
          console.log("from passport else db_user_data:", db_user_data.rows);
          user = {
            user_id: db_user_data.rows[0].user_id,
            username: db_user_data.rows[0].username,
            isLoggedIn: true,
            img: db_user_data.rows[0].img,
            accessToken: db_user_data.rows[0].access_token,
          };
          const userSettings = await client.query(
            "INSERT INTO user_app_settings(user_id) VALUES ($1) RETURNING *",
            [user.user_id]
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
          } = userSettings.rows[0];
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
          user = { ...user, preferences, learner };
          console.log("from passport else user:", user);
        }
        //console.log("from passport before done:", user)
        await client.query("COMMIT");
        done(null, user);
      } catch (error) {
        await client.query("ROLLBACK");
        console.error(error);
        done(error, false, error.message);
      } finally {
        client.release();
      }
    }
  )
);
//loads userData into req.session.passport.user
passport.serializeUser((user, done) => {
  console.log("from serializeUser", user);
  done(null, user);
});
// loads userData into req.user
passport.deserializeUser(async (user, done) => {
  console.log("from deserializeUser before query: user", user);
  const user_id = user.user_id;
  const updatedUser = await updateReqUser(user_id);
  console.log("from deserializeUser after query: updatedUser", updatedUser);
  done(null, updatedUser);
});
