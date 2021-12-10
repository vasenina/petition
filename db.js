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

//check how it works;
module.exports.addSign = (userFirst, userLast, userSign) => {
    console.log("DB:  i'm adding a  new sign");
    const q = `INSERT INTO signatures (first, last, signImg) 
                VALUES ($1, $2, $3)
                RETURNING id;`;
    const params = [userFirst, userLast, userSign];
    return db.query(q, params);
};

module.exports.getCountOfSigners = () => {
    const q = "SELECT COUNT (*) FROM signatures;";
    return db.query(q);
};

module.exports.getSignature = (id) => {
    console.log("DB: i'm getting a signature from ", id);
    const q = `SELECT signImg FROM signatures WHERE id = ${id};`;
    const params = [id];
    return db.query(q);
};
