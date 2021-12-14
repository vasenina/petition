const db = require("./db");

// db.getSigners()
//     .then((signers) => {
//         console.log(signers.rows);
//     })]е76ш7н8ыъ

// db.addUser("first", "lastFisrt", "b@b.com", "123")
//     .then((id) => {
//         db.addSign("dshajk", id).then((id=>
//             {
//                 console.log("sign added with id", id);
//             }))
//     .catch((err) => {
//         console.log(err);
//     });

db.addProfile(20, "London", "http://bhj", 2)
    .then((pass) => console.log(pass))
    .catch((err) => console.log("error", err));
//db.selectAllUsers().then((result) => console.log("allusers", //result));
