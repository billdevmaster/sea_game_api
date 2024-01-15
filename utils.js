const crypto = require('crypto');

function hashString(input) {
  const sha256 = crypto.createHash('sha256');
  sha256.update(input, 'utf8');
  return sha256.digest('hex');
}

const delay = ms => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

module.exports = {
  hashString, delay
}