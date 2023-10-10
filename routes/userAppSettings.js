const express = require("express");
const router = express.Router();
const isAuth = require("../middlewares/isAuth.js");
const pool = require("../db/index.js");

//--------Route for UPDATING user_app_settings table
//-----From UserAccount/UserAppSettings.js

router.post("/", isAuth, async (req, res) => {
  const { user_id, username, img, isLoggedIn } = req.user;
  const { preferences, learner } = req.body;
  console.log("from userAppSettings preferences:", preferences);
  const setClause = [];
  const values = [learner, user_id];
  preferences.forEach((pref, index) => {
    setClause.push(`${pref.name} = $${index + 3}`);
    values.push(pref.value);
  });
  //console.log("from userAppSettings setClause:", setClause);
  //console.log("from userAppSettings values:", values);
  const setClauseString = setClause.join(", ");
  //console.log("from userAppSettings setClauseString:", setClauseString);
  const query = `UPDATE user_app_settings SET ${setClauseString}, roots_learner = $1 WHERE user_id = $2 RETURNING *`;
  try {
    const updateSettings = await pool.query(query, values);
    console.log("from userAppSettings updateSettings:", updateSettings);
    if (updateSettings) {
      req.user = {
        user_id,
        username,
        img,
        isLoggedIn,
        preferences: {
          mathematics: updateSettings.rows[0].mathematics,
          material_science: updateSettings.rows[0].material_science,
          computer_science: updateSettings.rows[0].computer_science,
          miscellaneous: updateSettings.rows[0].miscellaneous,
          engineering: updateSettings.rows[0].engineering,
          technology: updateSettings.rows[0].technology,
          physics: updateSettings.rows[0].physics,
          geography: updateSettings.rows[0].geography,
          biology: updateSettings.rows[0].biology,
          chemistry: updateSettings.rows[0].chemistry,
          electronics: updateSettings.rows[0].electronics,
          astronomy: updateSettings.rows[0].astronomy,
          science: updateSettings.rows[0].science,
        },
        learner: updateSettings.rows[0].roots_learner,
      };
      const user = req.user;
      console.log("from userAppSettings user:", user);
      res.send(user);
    } else {
      res.status(400).send({ error: "Error with request" });
    }
  } catch (err) {
    console.error(err.message);
  }
});

module.exports = router;
