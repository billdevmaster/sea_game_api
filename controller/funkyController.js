const secretEncryptionKey = process.env.secretKey;

const register = async (req, res) => {
	const {hash, username, password, referral_code} = req.query;
  const input = username + password + "sea" + secretEncryptionKey;
  const hashServer = hashString(input);
  let sql = "";
  if (hashServer == hash) {
    // save 
    sql = `SELECT * FROM funky_users WHERE username='${username}'`;
    try {
      connection.query(sql, (err1, result1) => {
        if (err1) throw err1;
        console.log(result1);
        if (result1.length > 0) {
          res.status(500).json("username is already existed")
        } else {
          // add the referral marks
          if (referral_code && referral_code != "") {
            sql = `UPDATE funky_users SET referral_marks = referral_marks + 1 WHERE referral_code='${referral_code}'`;
            connection.query(sql, (err1, result1) => {
              if (err1) throw err1;
              console.log(result1);
            });
          }

          let new_referral_code = shortid.generate();
          sql = `INSERT INTO funky_users (
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
}

const login = async (req, res) => {
	const {hash, username, password} = req.query;
  const input = username + password + "sea" + secretEncryptionKey;
  const hashServer = hashString(input);
  let sql = "";
  if (hashServer == hash) {
    // save 
    sql = `SELECT * FROM funky_users WHERE username='${username}' and password='${crypto.createHash('md5').update(password).digest("hex")}'`;
    try {
      connection.query(sql, (err1, result1) => {
        if (err1) throw err1;
        console.log(result1);
        if (result1.length > 0) {
          // get rank
          sql = `Select count(*) as rank from funky_users where referral_marks > (select referral_marks from funky_users where id=${result1[0].id})`
          connection.query(sql, (err1, result2) => {
            return res.json({username: username, referral_code: result1[0].referral_code, referral_marks: result1[0].referral_marks, rank: (result2[0].rank + 1), id: result1[0].id});
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
}

const saveSolanaAddress = async (req, res) => {
	const {hash, address, id} = req.query;
  const input = id + address + "sea" + secretEncryptionKey;
  const hashServer = hashString(input);
  let sql = "";
  if (hashServer == hash) {
    sql = `UPDATE funky_users SET solana_address = '${address}' WHERE id=${id}`;
    try {
      connection.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result);
        return res.json("success");
      });
    } catch (e) {
      console.log(e)
      res.status(500).json("DB operation is failed");
    }
  } else {
    console.log("hash issue")
    res.status(500).json("Hash is not correct");
  }
}

const saveTwitterName = async (req, res) => {
	const {hash, username, id} = req.query;
  const input = id + username + "sea" + secretEncryptionKey;
  const hashServer = hashString(input);
  let sql = "";
  if (hashServer == hash) {
    sql = `UPDATE funky_users SET twitter_username = '${username}' WHERE id=${id}`;
    try {
      connection.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result);
        return res.json("success");
      });
    } catch (e) {
      console.log(e)
      res.status(500).json("DB operation is failed");
    }
  } else {
    console.log("hash issue")
    res.status(500).json("Hash is not correct");
  }
}

module.exports = {
	register, login, saveSolanaAddress, saveTwitterName
}