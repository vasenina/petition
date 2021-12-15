// check requiremments fields - on frontend or backend
//check how to use helpers
//make it impossible to change information about yourself
//add some picture
//add info that changes are ok
//https://fonts.google.com/specimen/Amatic+SC?category=Handwriting#standard-styles

const db = require("./db");

db.addProfile(20, "London", "http://bhj", 2)
    .then((pass) => console.log(pass))
    .catch((err) => console.log("error", err));
//db.selectAllUsers().then((result) => console.log("allusers", //result));
