

const isAuth = (req, res, next) => {
  //console.log("from isAuth:", req.user);
  if (req.user) {
    next();
  } else {
    res.status(401).send({ error: "You must be logged in to do that.", isLoading: false });
  }
};

module.exports = isAuth;
