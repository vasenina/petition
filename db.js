//will be where we have all our functions
//retriev/add/update

const spicedPg = require("spiced-pg");

const database = "petitiondb";
const username = "postgres";
const password = "postgres";

//comunication to the db

const db = spicedPg(
    process.env.DATABASE_URL ||
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
    console.log("DB: I.m adding a new user");
    const q = `INSERT INTO users (first, last, email, password) 
                VALUES ($1, $2, $3, $4)
                RETURNING id;`;
    const params = [userFirst, userLast, userEmail, userPW];
    return db.query(q, params);
};

module.exports.updateUserbyID = (id, first, last, email) => {
    console.log("DB: Updating user with id", id);
    const q = `UPDATE users
                SET first = $2, last  = $3, email = $4
                WHERE id = $1;`;
    const params = [id, first, last, email];
    return db.query(q, params);
};
module.exports.updateUserbyIDwithPassword = (
    id,
    first,
    last,
    email,
    password
) => {
    console.log("DB: Updating user & password with id", id);
    const q = `UPDATE users
                SET first = $2, last  = $3, email = $4, password = $5
                WHERE id = $1;`;
    const params = [id, first, last, email, password];
    return db.query(q, params);
};

module.exports.updateProfilesbyUserId = (user_id, age, city, url) => {
    console.log("DB: Updating profiles for user with id", user_id);
    const q = `INSERT INTO profiles (age, city, url, user_id)
                VALUES ($2, $3, $4, $1)
                ON CONFLICT (user_id)
                DO UPDATE SET age = $2, city = $3, url = $4;`;
    const params = [user_id, age, city, url];
    return db.query(q, params);
};

module.exports.addProfile = (age, city, url, user_id) => {
    console.log("DB: I.m adding a new profile");
    const q = `INSERT INTO profiles (age, city, url, user_id) 
                VALUES ($1, $2, $3, $4);`;
    const params = [age, city, url, user_id];
    return db.query(q, params);
};

module.exports.getUserIdandSignId = (email) => {
    const q = `SELECT users.id AS user_id , signatures.id AS sign_id , users.last AS last, users.first AS first
            FROM users 
            LEFT JOIN signatures 
            ON users.id = signatures.user_id 
            WHERE email = $1;`;
    const params = [email];
    return db.query(q, params);
};
//check how it works;
module.exports.addSign = (userSign, userId) => {
    console.log("DB:  i'm adding a  new sign");
    const q = `INSERT INTO signatures (signImg, user_id) 
                VALUES ($1, $2)
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

module.exports.getUserProfilebyID = (id) => {
    console.log("DB: getting user profile with id ", id);
    const q = `SELECT first, last, email, age, city FROM users
                LEFT JOIN profiles ON users.id = profiles.user_id
                WHERE users.id = $1;`;
    const params = [id];
    return db.query(q, params);
};

module.exports.selectAllsignedUsers = () => {
    const q = `SELECT first, last, age, city, url FROM signatures 
                LEFT JOIN users ON signatures.user_id  = users.id 
                LEFT JOIN profiles ON signatures.user_id = profiles.user_id;`;
    return db.query(q);
};

module.exports.selectAllsignedUsersByCity = (city) => {
    console.log("DN: I'm looking users from city", city);
    const q = `SELECT first, last, age, city, url FROM signatures 
        LEFT JOIN users ON signatures.user_id  = users.id 
        LEFT JOIN profiles ON signatures.user_id = profiles.user_id
        WHERE LOWER(profiles.city) = LOWER($1);`;
    const params = [city];
    return db.query(q, params);
};

module.exports.checkUrl = (url) => {
    console.log("DB is checking URL ", url);
    const checkingResult =
        url.startsWith("https:") ||
        url.startsWith("http:") ||
        url.startsWith("//");
    return checkingResult;
};
