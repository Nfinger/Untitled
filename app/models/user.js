const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    require: true,
    minlength: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

// Override mongoose toJSON method
UserSchema.methods.toJSON = function () {
  var user = this;
  // turn mongo user document into a javascript object
  var userObject = user.toObject();
  // only return user id and email
  return _.pick(userObject, ['_id', 'email']);
};

UserSchema.methods.generateAuthToken = function () {
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access}, 'abcdefg').toString();
  // User ES6 syntax to assign access and token values to user doc
  user.tokens.push({access, token});

  return user.save().then(() => {
    return token;
  });
};
/**
* findByToken
* Returns a user instance if token validation succeeds
* @param token String x-auth header value passed from request header
* @return User returns instance of matching user
*/
UserSchema.statics.findByToken = function (token) {
  var User = this;
  var decoded;

  try {
    // Try to validate user
    decoded = jwt.verify(token, 'abcdefg');
  } catch (e) {
    // Reject if validation fails
    return Promise.reject();
  }
  // Find and return the user
  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
};
/**
* findByCredentials
* Returns a user instance if login is valid
* @param email String client provided email
* @param password String client provided plaintext password
* @return User returns instance of matching user
*/
UserSchema.statics.findByCredentials = function (email, password) {
  var User = this;

  return User.findOne({email}).then((user) => {
    if (!user) {
      // trigger catch in calling promise
      return Promise.reject();
    }

    return new Promise((resolve, reject) => {
      // compare passwords
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          resolve(user);
        } else {
          reject();
        }
      });
    });
  });
};

UserSchema.pre('save', function (next) {
  var user = this;
  // If user password has been modified hash password and save
  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

var User = mongoose.model('User', UserSchema);

module.exports = {User};
