const express = require("express");
const router = express.Router();
const isAuth = require("../middlewares/isAuth.js");
const pool = require("../db/index.js");

//--------Route for user_favorite_videos table
const favoritesRouter = require("./favoriteVideos.js");
router.use("/favorites", favoritesRouter);

//--------Route for user_app_settings table
const userAppSettingsRouter = require("./userAppSettings.js");
router.use("/app-settings", userAppSettingsRouter);

//--------Route for user_viewed_videos table
const addViewedRouter = require("./addViewed.js");
router.use("/addViewed", addViewedRouter);

//--------Route for answered_questions table
const answeredQuestionsRouter = require("./answeredQuestions.js");
router.use("/answered-questions", answeredQuestionsRouter);

module.exports = router;
