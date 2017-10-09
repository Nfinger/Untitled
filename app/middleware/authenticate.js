var {User} = require('./../models/user');

var authenticate = (req, res, next) => {
  var token = req.header('x-auth');

  User.findByToken(token).then((user) => {
    if (!user) {
      // Repsond with catch
      return Promise.reject();
    }
    // Send user info to the route
    req.user = user;
    req.token = token;
    next();
  }).catch((e) => {
    // Authentication required 401
    res.status(401).send();
  });
};

module.exports = {authenticate};
