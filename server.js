const express = require("express");
const app = express();
const db = require("./db");
const cookieSession = require("cookie-session");
const { hash, compare } = require("./bc");
const emj = require("./emoji");

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
        secret:
            process.env.SESSION_SECRET || require("./passwords").sessionSecret,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        sameSite: true,
    })
);

//req.session.user_id;
//req.session.sign_id;
//req.session.first
//req.session.last
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

    if (req.session?.user_id) {
        if (req.session?.sign_id) {
            console.log("this user signed a petition:", req.session.user_id);
            res.redirect("/thanks");
            return;
        }
        res.render("petition", {
            layout: "main",
            signedError,
            last: req.session.last,
            first: req.session.first,
        });
    } else {
        res.redirect("/login");
    }
});

app.get("/signers/:city", (req, res) => {
    const city = req.params.city;
    console.log("req.params", req.params);
    console.log("GET signers/city with city", city, req.params.city);

    if (req.session?.sign_id) {
        db.selectAllsignedUsersByCity(city)
            .then(({ rows }) => {
                //console.log("results.rows", rows);
                for (let i in rows) {
                    rows[i].emj = emj.getEmoji();
                }
                res.render("signers", {
                    layout: "main",
                    signers: rows,
                    last: req.session.last,
                    first: req.session.first,
                    byCity: true,
                });
            })
            .catch((err) => {
                console.log("err in getSigners", err);
            });
    } else {
        res.redirect("/petition");
    }
});

app.get("/signers", (req, res) => {
    if (req.session?.sign_id) {
        db.selectAllsignedUsers()
            .then(({ rows }) => {
                // console.log("results.rows", rows);
                for (let i in rows) {
                    rows[i].emj = emj.getEmoji();
                }
                rows[0].emj = emj.getEmoji();
                //console.log("results.rows", rows);
                res.render("signers", {
                    layout: "main",
                    last: req.session.last,
                    first: req.session.first,
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
    if (req.session?.sign_id) {
        const countPromise = db.getCountOfSigners();
        const signaturePromise = db.getSignature(req.session.sign_id);
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
                    last: req.session.last,
                    first: req.session.first,
                });
            })
            .catch((err) => {
                console.log("Error in Thanks Promises", err);
                res.render("thanks", {
                    layout: "main",
                    last: req.session.last,
                    first: req.session.first,
                });
            });
    } else {
        res.redirect("/petition");
    }
});

app.post("/petition", (req, res) => {
    console.log("im in POST petition with data ");

    db.addSign(req.body.signature, req.session.user_id)
        .then(({ rows }) => {
            console.log("ID new user:", rows[0].id);
            req.session.sign_id = rows[0].id;
            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log("sign not added", err);
            res.redirect("/petition?signed=error");
        });
});

app.get("/register", (req, res) => {
    console.log("user see a register page");
    if (req.session?.user_id) {
        res.redirect("/");
    } else {
        res.render("register", {
            layout: "main",
        });
    }
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
            req.session.first = req.body.first;
            req.session.last = req.body.last;
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
            req.session.sign_id = null;
            res.redirect("/profile");
        })
        .catch((err) => {
            res.redirect("/register?register=error");
            console.log("error in hashPw", err);
        });
});
app.get("/login", (req, res) => {
    if (req.session?.user_id) {
        res.redirect("/");
    } else {
        res.render("login", {});
    }
});
app.post("/login", (req, res) => {
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
                return db.getUserIdandSignId(req.body.email);
            } else {
                res.redirect("/login?login=error");
            }
        })
        .then(({ rows }) => {
            console.log(
                "users id and sign id:",
                rows[0].user_id,
                rows[0].sign_id
            );
            //here we should set cookies
            req.session.user_id = rows[0].user_id;
            req.session.sign_id = rows[0].sign_id;
            req.session.last = rows[0].last;
            req.session.first = rows[0].first;

            res.redirect("/petition");
        })
        .catch((err) => {
            console.log("error in compare pw", err);
            res.redirect("/login?login=error");
        });
    //res.sendStatus(200);
});

app.get("/profile/edit", (req, res) => {
    if (req.session?.user_id) {
        db.getUserProfilebyID(req.session.user_id)
            .then(({ rows }) => {
                console.log("GET/profile/edit  i'm showing data from database");
                res.render("profile", {
                    layout: "main",
                    profile: rows[0],
                    first: req.session.first,
                    last: req.session.last,
                    edit: true,
                });
            })
            .catch((err) => console.log("Err in getProfilebyID", err));
    } else {
        res.redirect("/");
    }
});
app.post("/profile/edit", (req, res) => {
    console.log("POST/profile/edit: I'm editing a profile");
    let url = "";
    let age = null;
    if (db.checkUrl(req.body.url)) {
        url = req.body.url;
    }
    if (req.body.age != "") {
        age = req.body.age;
    }
    if (!req.body.password) {
        //update data in 2 tables with Promise all
        let updateUsers = db.updateUserbyID(
            req.session.user_id,
            req.body.first,
            req.body.last,
            req.body.email
        );
        let updateProfiles = db.updateProfilesbyUserId(
            req.session.user_id,
            age,
            req.body.city,
            url
        );
        Promise.all([updateUsers, updateProfiles])
            .then(() => {
                req.session.last = req.body.last;
                req.session.first = req.body.first;
                res.redirect("/profile/edit");
            })
            .catch((err) => {
                console.log("err in updating users or profiles db", err);
            });
    } else {
        hash(req.body.password).then((pass) => {
            let updateUsers = db.updateUserbyIDwithPassword(
                req.session.user_id,
                req.body.first,
                req.body.last,
                req.body.email,
                pass
            );
            let updateProfiles = db.updateProfilesbyUserId(
                req.session.user_id,
                age,
                req.body.city,
                url
            );
            Promise.all([updateUsers, updateProfiles])
                .then(() => {
                    req.session.last = req.body.last;
                    req.session.first = req.body.first;
                    res.redirect("/profile/edit");
                })
                .catch((err) => {
                    console.log("err in updating users or profiles db", err);
                });
        });

        //user has changed
        //we should update db
        //
        //req.body.password;
    }
});

app.get("/profile", (req, res) => {
    if (req.session?.user_id) {
        res.render("profile", {
            layout: "main",
            first: req.session.first,
            last: req.session.last,
        });
    } else {
        res.redirect("/");
    }
});

app.post("/profile", (req, res) => {
    if (req.body.age == "" && req.body.city == "" && req.body.url == "") {
        console.log("POST/profile no data");
        res.redirect("/petition");
    } else {
        console.log("POST PROFILE", req.body);
        let url = "";
        let age = null;
        if (db.checkUrl(req.body.url)) {
            url = req.body.url;
        }
        if (req.body.age != "") {
            age = req.body.age;
        }
        db.addProfile(age, req.body.city, url, req.session.user_id)
            .then(() => {
                res.redirect("/petition");
            })
            .catch((err) => {
                console.log("Error in adding new profile", err);
            });
    }
});

app.post("/delete-signature", (req, res) => {
    //delete a signature here
    res.redirect("/");
});

app.listen(process.env.PORT || 8080, () => {
    console.log("Petition server is listening on 8080..");
});
