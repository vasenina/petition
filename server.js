const express = require("express");
const app = express();
const db = require("./db");

const { engine } = require("express-handlebars");
app.engine("handlebars", engine());
app.set("view engine", "handlebars");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("./public"));

app.get("/petition", (req, res) => {
    const signedError = req.query.signed == "error";
    console.log(signedError);
    console.log(req.query);
    res.render("petition", {
        layout: "main",
        signedError,
    });
});

app.get("/signers", (req, res) => {
    db.getSigners()
        .then(({ rows }) => {
            //console.log("results.rows", rows);
            res.render("signers", {
                layout: "main",
                signers: rows,
            });
        })
        .catch((err) => {
            console.log("err in getSigners", err);
        });
});

app.get("/thanks", (req, res) => {
    db.getCountOfSigners()
        .then((signersCount) => {
            console.log(signersCount.rows[0].count);
            res.render("thanks", {
                layout: "main",
                signersCount: signersCount.rows[0].count,
            });
        })
        .catch((err) => {
            console.log("no count of signed", err);
            res.render("thanks", {
                layout: "main",
            });
        });
});

app.post("/petition", (req, res) => {
    console.log("im in POST petition");
    console.log(req.body);
    db.addSign(req.body.first, req.body.last, "smth")
        .then(() => {
            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log("sign not added", err);
            res.redirect("/petition?signed=error");
        });
});

app.listen(8080, () => {
    console.log("Petition server is listening..");
});
