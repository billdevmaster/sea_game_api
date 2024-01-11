const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const crypto = require('crypto');
const cors = require('cors');
const axios = require('axios');
const shortid = require('shortid');
require('dotenv').config();
const app = express();

const secretEncryptionKey = process.env.secretKey;
const configuration = {
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database,
  acquireTimeout: 10000000000
};
const rate = 4; // 1 credit = 4 tokens
let connection;


handleDisconnect();

app.use(bodyParser.json());
app.use(cors({ origin: '*' }));
// Define a route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.post('/register', async (req, res) => {
  const {hash, username, password, referral_code} = req.query;
  const input = username + password + "sea" + secretEncryptionKey;
  const hashServer = hashString(input);
  let sql = "";
  if (hashServer == hash) {
    // save 
    sql = `SELECT * FROM sea_users WHERE username='${username}'`;
    try {
      connection.query(sql, (err1, result1) => {
        if (err1) throw err1;
        console.log(result1);
        if (result1.length > 0) {
          res.status(500).json("username is already existed")
        } else {
          // add the referral marks
          if (referral_code && referral_code != "") {
            sql = `UPDATE sea_users SET referral_marks = referral_marks + 1 WHERE referral_code='${referral_code}'`;
            connection.query(sql, (err1, result1) => {
              if (err1) throw err1;
              console.log(result1);
            });
          }

          let new_referral_code = shortid.generate();
          sql = `INSERT INTO sea_users (
            username, 
            password, referral_code) VALUES (
            '${username}', 
            '${crypto.createHash('md5').update(password).digest("hex")}', '${new_referral_code}')`;
          try {
            connection.query(sql, (err1, result1) => {
              if (err1) throw err1;
              console.log(result1);
              res.json({success: "true"})
            });
          } catch (e) {
            res.status(500).json("DB operation is failed")
          }
        }
      });
    } catch (e) {
      res.status(500).json("DB operation is failed")
    }
  } else {
    res.status(500).json("Hash is not correct")
  }
});

app.post('/login', async (req, res) => {
  const {hash, username, password} = req.query;
  const input = username + password + "sea" + secretEncryptionKey;
  const hashServer = hashString(input);
  let sql = "";
  if (hashServer == hash) {
    // save 
    console.log(crypto.createHash('md5').update(password).digest("hex"))
    sql = `SELECT * FROM sea_users WHERE username='${username}' and password='${crypto.createHash('md5').update(password).digest("hex")}'`;
    try {
      connection.query(sql, (err1, result1) => {
        if (err1) throw err1;
        console.log(result1);
        if (result1.length > 0) {
          // get rank
          sql = `Select count(*) as rank from sea_users where referral_marks > (select referral_marks from sea_users where id=${result1[0].id})`
          connection.query(sql, (err1, result2) => {
            return res.json({username: username, referral_code: result1[0].referral_code, referral_marks: result1[0].referral_marks, rank: result2[0].rank});
          });

        } else {
          res.status(500).json("credentials are not correct");
        }
      });
    } catch (e) {
      res.status(500).json("DB operation is failed");
    }
  } else {
    res.status(500).json("Hash is not correct");
  }
});

// Start the server
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

function hashString(input) {
  const sha256 = crypto.createHash('sha256');
  sha256.update(input, 'utf8');
  return sha256.digest('hex');
}

function handleDisconnect() {
  connection = mysql.createConnection(configuration);

  connection.connect(function(err) {
    if (err) {
      console.log("error when connecting to db:", err);
      setTimeout(handleDisconnect, 2000);
    }else{
        console.log("connection is successfull");
    }
  });
  connection.on("error", function(err) {
    console.log("db error", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      handleDisconnect();
    } else {
      throw err;
    }
  });
}

const delay = ms => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};
