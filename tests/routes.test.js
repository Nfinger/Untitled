const expect = require('expect');
const request = require('supertest');
const {app} = require('./../server');
const { ObjectID } = require('mongodb');
const { User } = require('./../app/models/user');
// Create mock data for testing
const users = [
  {
    _id: new ObjectID(),
    email: 'testemail1@gmail.com',
    password: 'testpass'
  },
  {
    _id: new ObjectID(),
    email: 'testemail2@gmail.com',
    password: 'testpass2'
  }
];

// Wipe the user collection and insert with mock data
beforeEach((done) => {
  User.remove({}).then(() => {
    return User.insertMany(users);
  }).then(() => done());
});


describe('Post /user', () => {
  it('should create a new user', (done) => {
    var newUser = {
      email: 'kevin@gmail.com',
      password: 'testpaswword'
    };
    request(app)
      .post('/user')
      .send(newUser)
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toBe(send.email);
      })
      .end((err, res) => {
      if (err) {
        return done(err);
      }

      // Verify our post request was actually added to database
      User.find(newUser).then((res) => {
        expect(res.length).toBe(1);
        expect(res[0].email).toBe(newUser.email);
        done();
      }).catch((e) => done(e));
    });
  });
});
