const express = require("express");
const app = express();
const db = require("./db");
const cookieSession = require("cookie-session");
const { hash, compare } = require("./bc");
const emj = require("./emoji");

const { engine } = require("express-handlebars");

//ROUTERS
const { authRouter } = require("./routers/auth-router.js");

app.engine("handlebars", engine());
app.set("view engine", "handlebars");

if (process.env.NODE_ENV == "production") {
    app.use((req, res, next) => {
        if (req.headers["x-forwarded-proto"].startsWith("https")) {
            return next();
        }
        res.redirect(`https://${req.hostname}${req.url}`);
    });
}

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
app.use(authRouter);

app.use((req, res, next) => {
    if (
        !req.session?.user_id &&
        req.url != "/login" &&
        req.url != "/register" &&
        req.url != "/clear"
    ) {
        res.redirect("/register");
    } else {
        next();
    }
});

function requireNotSigned(req, res, next) {
    if (req.session?.sign_id) {
        res.redirect("/thanks");
        return;
    } else {
        next();
    }
}
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
    return;
});

app.get("/petition", requireNotSigned, (req, res) => {
    //const signedError = req.query.signed == "error";

    res.render("petition", {
        layout: "main",
        last: req.session.last,
        first: req.session.first,
    });
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
    if (req.body.signature == "") {
        res.render("petition", {
            layout: "main",
            last: req.session.last,
            first: req.session.first,
        });
        return;
    }

    db.addSign(req.body.signature, req.session.user_id)
        .then(({ rows }) => {
            console.log("ID new user:", rows[0].id);
            req.session.sign_id = rows[0].id;
            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log("sign not added", err);
            res.render("petition", {
                layout: "main",
                signedError: true,
                last: req.session.last,
                first: req.session.first,
            });
            return;
        });
});

app.get("/profile/edit", (req, res) => {
    db.getUserProfilebyID(req.session.user_id)
        .then(({ rows }) => {
            console.log("GET/profile/edit  i'm showing data from database");
            console.log(req.query);
            const upd = req.query.upd;
            res.render("profile", {
                layout: "main",
                profile: rows[0],
                first: req.session.first,
                last: req.session.last,
                edit: true,
                upd,
            });
        })
        .catch((err) => console.log("Err in getProfilebyID", err));
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
                res.redirect("/profile/edit?upd=true");
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
    res.render("profile", {
        layout: "main",
        first: req.session.first,
        last: req.session.last,
    });
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
    db.deleteSignature(req.session.user_id)
        .then(() => {
            req.session.sign_id = null;
            res.redirect("/");
        })
        .catch((err) => {
            console.log("error in deleting signature", err);
        });
});

app.post("/logout", (req, res) => {
    req.session = null;
    return res.redirect("/");
});

app.post("/delete-profile", (req, res) => {
    console.log("Want to delete user with id", req.session.id);

    const id = req.session?.user_id;
    let deleteSign = db.deleteSignature(id);
    let deleteProfile = db.deleteProfile(id);
    Promise.all([deleteSign, deleteProfile])
        .then(() => {
            return db.deleteUser(id);
        })
        .then(() => {
            console.log("user with id ", id, "deleted");
            req.session = null;
            res.redirect("/");
        })
        .catch((err) => {
            console.log("Error in deleting user", err);
        });
});

app.listen(process.env.PORT || 8080, () => {
    console.log("Petition server is listening on 8080..");
});
