const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const db = require('./database/dbConfig.js');
const Users = require('./users/users-model.js');

const server = express();

server.use(helmet());
server.use(express.json());
server.use(cors());

server.get('/', (req, res) => {
  res.send("It's alive!");
});


server.post('/api/register', (req, res) => {

  let { username, password } = req.body;

  const hash = bcrypt.hashSync(password, 8)

  Users.add({ username, password: hash })
    .then(saved => {
      res.status(200).json(saved)
    })
    .catch(err => {
      res.status(500).json(err)
    })
});


server.post('/api/login', (req, res) => {
  let { username, password } = req.body;

  Users.findBy({ username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        res.status(200).json({ message: `Welcome ${user.username}!` });
      } else {
        res.status(401).json({ message: 'Invalid Credentials' });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

server.get('/api/users', (req, res) => {
  Users.find()
    .then(users => {
      res.status(200).json(users);
    })
    .catch(err => res.send(err));
});


server.get('/hash', (req, res) => {
  // read a password from the Authorization header
  const name = req.query.name;

  // return an object with the password hashed using bcryptjs
  const hash = bcrypt.hashSync(name, 8);

  // { hash: '970(&(:OHKJHIY*HJKH(*^)*&YLKJBLKJGHIUGH(*P' }
  res.send(`The hash for ${name} is ${hash}`)
});


// implement the protected middleware that will check for username and password
// in the headers and if valid provide access to the endpoint
function protected(req, res, next) {

}


const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));
