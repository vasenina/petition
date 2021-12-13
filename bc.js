const bcrypt = require("bcryptjs");
const { genSalt, hash, compare } = bcrypt;

module.exports.compare = compare;
module.exports.hash = (plainTextPw) =>
    genSalt().then((salt) => hash(plainTextPw, salt));

// genSalt()
//     .then((salt) => {
//         console.log("salt", salt);
//         return hash("password123", salt);
//     })
//     .then((hashPW) => {
//         console.log("hashed and salted pw:", hashPW);
//         return compare("password123", hashPW);
//     })
//     .then((matchValue) => console.log("is the password correct", matchValue));
