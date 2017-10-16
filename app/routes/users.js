var {User} = require('../models/user');
var {authenticate} = require ('../middleware/authenticate');

module.exports = (app) => {
    // POST /user
    app.post('/user', (req, res) => {
        var body = _.pick(req.body, ['email', 'password']);
        var user = new User(body);

        user.save().then(() => {
            return user.generateAuthToken();
        }).then((token) => {
            res.header('x-auth', token).send(user);
        }).catch((e) => {
            res.status(400).send(e);
        });
    });

    app.get('/user/me', authenticate, (req, res) => {
        res.send(req.user);
    });

    // Login route
    app.post('/user/login', (req, res) => {
        var body = _.pick(req.body, ['email', 'password']);
        // Try and validate provided user credentials
        User.findByCredentials(body.email, body.password).then((user) => {
            return user.generateAuthToken().then((token) => {
            // Set new x-auth token and return the user
            res.header('x-auth', token).send(user);
            });
        }).catch((e) => {
            res.status(400).send();
        });
    });
}