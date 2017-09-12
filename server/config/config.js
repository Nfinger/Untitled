// Set env variable for correct db connection; package.json sets the test env
var env = process.env.NODE_ENV || 'development';
console.log('env**********',env);
if (env === 'development') {
  process.env.PORT = 3000;
  process.env.MONGODB_URI = 'mongodb://localhost:27017/HeadStart'
} else if (env === 'test') {
  process.env.PORT = 3000;
  process.env.MONGODB_URI = 'mongodb://localhost:27017/HeadStartTest'
}
