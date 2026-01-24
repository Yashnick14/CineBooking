const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'yoursecretkey', {
    expiresIn: '30d',
  });
};

module.exports = generateToken;
