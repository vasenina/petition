const db = require("./db");

db.getSigners()
    .then((signers) => {
        console.log(signers.rows);
    })
    .catch((err) => {
        console.log(err);
    });
