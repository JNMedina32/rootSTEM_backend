const express = require("express");
require("dotenv").config();
const isAuth = require("./middlewares/isAuth.js");
const session = require("express-session");
const cors = require("cors");
const passport = require("passport");

require("./auth.js");

const app = express();

app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

app.set("view engine", "ejs");

app.use(
  session({
    secret: [process.env.COOKIE_SECRET],
    cookie: {
      secure: process.env.NODE_ENV === "production" ? "true" : "auto",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
    resave: false,
    saveUninitialized: false,
  })
);


app.use(passport.session());
app.use(passport.authenticate('session'));


//---------------Login/Create Routes
const authRouter = require("./routes/authRouter.js");
app.use("/auth", authRouter);
const createUserRouter = require("./routes/createUser.js");
app.use("/create_user", createUserRouter);
const loginRouter = require("./routes/login.js");
app.use("/login", loginRouter);

//---------------Update Routes 
const userAccountRouter = require("./routes/userAccount.js");
app.use("/userAccount", userAccountRouter);
const updateUsernameRouter = require("./routes/updateUsername.js");
app.use("/update_username", updateUsernameRouter);
const updatePasswordRouter = require("./routes/updatePassword.js");
app.use("/update_password", updatePasswordRouter);

//---------------Home Routes
const homeRouter = require("./routes/home.js");
app.use("/home", homeRouter);


//------------Route to verify user is logged in
app.get("/account", isAuth, (req, res) => {
  const isLoggedIn = true;
  const reqUser = req.user;
  const user = {...reqUser, isLoggedIn};
  console.log('from /account', user);
  res.send(user);
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  // res.redirect("/login");
  res.send({ logout: "Successfully logged out" });
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
