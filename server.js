require('./config/config');

const express = require('express');
const hbs = require('hbs');
const fs = require('fs');
const bodyParser = require('body-parser');
const _ = require('lodash');

var {mongoose} = require('./config/mongoose');
var {User} = require('./app/models/user');
var {authenticate} = require ('./app/middleware/authenticate');
// Configure port to use
const port = process.env.PORT;
var app = express();

hbs.registerPartials(__dirname + '/views/partials');
// __dirname fetches the system path to project folder
app.set('view engine', 'hbs');

app.use(bodyParser.json());

// Create a server log middleware\
app.use((req, res, next) => {
  var now = new Date().toString();
  var log = `${now}: ${req.method} ${req.url}`;
  // Timestamp, HTTP request, Requested URL path
  console.log(log);
  fs.appendFile('server.log', log + '\n', (err) => {
    if (err) {
      console.log('Unable to append to server.log')
    }
  });
  next();
});

// Maintenance view
// app.use((req, res, next) => {
//   res.render('maintenance.hbs');
// });

// Use our public directory
app.use(express.static(__dirname + '/public'));

// Helpers
hbs.registerHelper('getCurrentYear', () => {
  return new Date().getFullYear();
});

hbs.registerHelper('screamIt', (text) => {
  return text.toUpperCase();
});

// Handlers
app.get('/', (req, res) => {
  // res.send('<h1>Hello Express!</h1>');
  res.render('home.hbs', {
    pageTitle: 'Home Page',
    welcomeMessage: 'Welcome to the site fam'
  });
});

app.get('/about', (req, res) => {
  res.render('about.hbs', {
    pageTitle: 'About Page'
  });
});

app.get('/bad', (req, res) => {
  res.send({
    errorMessage: 'Error handling request'
  });
});

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


app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});

module.exports = {app};
