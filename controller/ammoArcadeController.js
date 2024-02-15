const utils = require("../utils.js");
const shortid = require('shortid');
const crypto = require('crypto');
const secretEncryptionKey = process.env.secretKey;

const saveScore = async (req, res, connection) => {
	const {hash, address, score} = req.query;
	console.log(req.query)
	const input = address + score + "sea" + secretEncryptionKey;
	console.log(input)
	const hashServer = utils.hashString(input);
	let sql = "";
	if (hashServer == hash) {
		sql = `SELECT * FROM ammo_arcade_score WHERE address='${address}'`;
		try {
	      	connection.query(sql, (err1, result) => {
		        if (err1) throw err1;
		        console.log(result);
		        if (result.length > 0) {
		        	// update
		        	if (score * 1 > result[0].score) {
		        		sql = `UPDATE ammo_arcade_score SET score=${score} WHERE address='${address}'`;
		        		connection.query(sql, (err1, result1) => {
							if (err1) throw err1;
							console.log(result1);
							return res.json({success: "true"});
						});
		        	} else {
						return res.json({success: "true"});
		        	}
		        } else {
		        	// insert
		        	sql = `INSERT INTO ammo_arcade_score (
			            address, 
			            score) VALUES (
			            '${address}', 
			            ${score * 1})`;
			        connection.query(sql, (err1, result1) => {
						if (err1) throw err1;
						console.log(result1);
						return res.json({success: "true"});
					});
		        }
	    	});
	    } catch (e) {
	    	console.log(e)
			res.status(500).json("DB operation is failed")
	    }
	} else {
		console.log(hash, hashServer)
		console.log("hast error")
	}
}

const getLeaderboard = async (req, res, connection) => {
	const {page} = req.query;
	let sql = "";
	sql = `SELECT * FROM ammo_arcade_score ORDER BY score DESC LIMIT ${10 * (page * 1 - 1)}, 10`;
	try {
		connection.query(sql, (err1, result) => {
		    if (err1) throw err1;
		    console.log(result);
		    return res.json(result);
		});
	} catch (e) {
		console.log(e)
		res.status(500).json("DB operation is failed")		
	}
}

module.exports = {
	saveScore, getLeaderboard
}