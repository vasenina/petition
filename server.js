const express = require("express");
const app = express();
const db = require("./db");
const cookieSession = require("cookie-session");

const { engine } = require("express-handlebars");

app.engine("handlebars", engine());
app.set("view engine", "handlebars");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("./public"));
app.use(
    cookieSession({
        secret: "HelloWorld",
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

app.get("/", (req, res) => {
    console.log("req.session before: ", req.session);
    req.session.onion = "bigSecret99";
    console.log("req.session before: ", req.session);

    res.redirect("/petition");
});

app.get("/petition", (req, res) => {
    const signedError = req.query.signed == "error";
    console.log(signedError);
    console.log(req.query);
    if (req.session.onion === "bigSecret99") {
        res.render("petition", {
            layout: "main",
            signedError,
        });
    } else {
        res.send(`<h1>PERMISSION DENIED</h1>`);
    }
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
                signature: req.session.signID,
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
        .then(({ rows }) => {
            console.log("ID new user:", rows[0].signid);
            req.session.signID = rows[0].signid;
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
