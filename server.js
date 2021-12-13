const express = require("express");
const app = express();
const db = require("./db");
const cookieSession = require("cookie-session");
const { hash, compare } = require("./bc");

const { engine } = require("express-handlebars");

app.engine("handlebars", engine());
app.set("view engine", "handlebars");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("./public"));
//prevent clickjacking
app.use((req, res, next) => {
    res.setHeader("x-frame-options", "deny");
    next();
});
app.use(
    cookieSession({
        secret: "HelloWorld",
        maxAge: 1000 * 60 * 60 * 24 * 14,
        sameSite: true,
    })
);

app.get("/", (req, res) => {
    //console.log("req.session before: ", req.session);
    req.session.onion = "bigSecret99";
    // console.log("req.session before: ", req.session);

    res.redirect("/petition");
});

app.get("/clear", (req, res) => {
    req.session = null;
    console.log("Clear cookies", req.session);
    res.redirect("/");
});

app.get("/petition", (req, res) => {
    const signedError = req.query.signed == "error";
    //console.log(signedError);
    // console.log(req.query);
    if (req.session.onion === "bigSecret99") {
        if (req.session.id) {
            console.log("I know this user:", req.session.id);
            res.redirect("/thanks");
            return;
        }
        res.render("petition", {
            layout: "main",
            signedError,
            last: "Funky",
            first: "Chicken",
        });
    } else {
        res.send(`<h1>PERMISSION DENIED</h1>`);
        req.session.onion = "bigSecret99";
    }
});

app.get("/signers", (req, res) => {
    if (req.session?.id) {
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
    } else {
        res.redirect("/petition");
    }
});

app.get("/thanks", (req, res) => {
    if (req.session?.id) {
        const countPromise = db.getCountOfSigners();
        const signaturePromise = db.getSignature(req.session.id);
        Promise.all([countPromise, signaturePromise])
            .then((value) => {
                // console.log(signersCount.rows[0].count);
                // console.log(
                //     "there is a signature from data",
                //     value[1].rows[0].signimg
                // );
                res.render("thanks", {
                    layout: "main",
                    signersCount: value[0].rows[0].count,
                    signature: value[1].rows[0].signimg,
                });
            })
            .catch((err) => {
                console.log("Error in Thanks Promises", err);
                res.render("thanks", {
                    layout: "main",
                });
            });
    } else {
        res.redirect("/petition");
    }
});

app.post("/petition", (req, res) => {
    console.log("im in POST petition");

    db.addSign(req.body.first, req.body.last, req.body.signature)
        .then(({ rows }) => {
            // console.log("ID new user:", rows[0].id);
            req.session.id = rows[0].id;
            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log("sign not added", err);
            res.redirect("/petition?signed=error");
        });
});

app.get("/register", (req, res) => {
    console.log("user see a register page");
    res.render("register", {
        layout: "main",
    });
});

app.post("/register", (req, res) => {
    //here we recieve user data to register
    //
    hash(req.body.password)
        .then((hashedPw) => {
            console.log("hashed pw:", hashedPw);
            console.log(
                "register-post i want to add this in db",
                req.body.first,
                req.body.last,
                req.body.email,
                hashedPw
            );
            return db.addUser(
                req.body.first,
                req.body.last,
                req.body.email,
                hashedPw
            );
        })
        .then((userID) => {
            // console.log("ID of new user for cookies", userID.rows[0].id);
            req.session.user_id = userID.rows[0].id;
            res.redirect("/petition");
        })
        .catch((err) => {
            res.redirect("/register?register=error");
            console.log("error in hashPw", err);
        });
});
app.get("/login", (req, res) => {
    res.render("login", {});
});
app.post("/login", (req, res) => {
    //here we will want to use compare
    //retrieve this pw for the email

    //
    console.log("login post body", req.body);
    db.getPassword(req.body.email)
        .then((hashFromDatabase) => {
            console.log("hashFromDatabase", hashFromDatabase.rows[0].password);
            return compare(
                req.body.password,
                hashFromDatabase.rows[0].password
            );
        })
        .then((match) => {
            console.log("do provided pw and db stored hash mash", match);
            if (match) {
                // ask user id and sign id for this user
                res.redirect("/petition");
            } else {
                res.redirect("/login?login=error");
            }
        })
        .catch((err) => {
            console.log("error in compare pw", err);
            res.redirect("/login?login=error");
        });
    //res.sendStatus(200);
});

app.listen(8080, () => {
    console.log("Petition server is listening..");
});
