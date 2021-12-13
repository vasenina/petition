//will be where we have all our functions
//retriev/add/update

const spicedPg = require("spiced-pg");

const database = "petitiondb";
const username = "postgres";
const password = "postgres";

//comunication to the db

const db = spicedPg(
    `postgress:${username}:${password}:@localhost:5432/${database}`
);

console.log(`[db] connecting to ${database}`);
//console.log(db);

// db.query("SELECT * FROM actors")
//     .then((dbResult) => {
//         console.log("result from db:", dbResult.rows);
//     })
//     .catch((err) => console.log("err in query", err));

module.exports.getSigners = () => {
    return db.query("SELECT last, first FROM signatures");
};

module.exports.addUser = (userFirst, userLast, userEmail, userPW) => {
    console.log("DB: I.m addin a new user");
    const q = `INSERT INTO users (first, last, email, password) 
                VALUES ($1, $2, $3, $4)
                RETURNING id;`;
    const params = [userFirst, userLast, userEmail, userPW];
    return db.query(q, params);
};
//check how it works;
module.exports.addSign = (userSign, userId) => {
    console.log("DB:  i'm adding a  new sign");
    const q = `INSERT INTO signatures (signImg, user_id) 
                VALUES ($1, $2);
                RETURNING id;`;
    const params = [userSign, userId];
    return db.query(q, params);
};

module.exports.getPassword = (email) => {
    console.log("DB: i'm getting a password for this email", email);
    const q = `SELECT password FROM users WHERE email =$1;`;
    const params = [email];
    return db.query(q, params);
};

module.exports.getCountOfSigners = () => {
    const q = "SELECT COUNT (*) FROM signatures;";
    return db.query(q);
};

module.exports.getSignature = (id) => {
    console.log("DB: i'm getting a signature from ", id);
    const q = `SELECT signImg FROM signatures WHERE id = $1;`;
    const params = [id];
    return db.query(q, params);
};

module.exports.selectAllUsers = () => {
    const q = `SELECT * FROM users;`;
    return db.query(q);
};
