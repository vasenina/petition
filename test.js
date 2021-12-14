//make it impossible to vhenge information about yourself
//add some picture

const db = require("./db");

db.addProfile(20, "London", "http://bhj", 2)
    .then((pass) => console.log(pass))
    .catch((err) => console.log("error", err));
//db.selectAllUsers().then((result) => console.log("allusers", //result));
