const express = require("express");
const app = express();
const db = require("./db");

const { engine } = require("express-handlebars");
app.engine("handlebars", engine());
app.set("view engine", "handlebars");

app.use(express.static("./public"));

app.get("/petition", (req, res) => {
    res.render("petition", {
        layout: "main",
    });
});

app.get("/signers", (req, res) => {
    db.getSigners()
        .then(({ rows }) => {
            console.log("results.rows", rows);
            console.log(rows[0]);
            res.render("signers", {
                layout: "main",
                signers: rows,
            });
        })
        .catch((err) => {
            console.log("err in getSigners", err);
        });
});

app.post("/add-actor", (req, res) => {
    // db.addActor("janelle Mone", 36)
    //     .then(() => {
    //         console.log("actor added");
    //     })
    //     .catch((err) => {
    //         console.log("actor NOT added", err);
    //     });
});

app.listen(8080, () => {
    console.log("Petition server is listening..");
});
