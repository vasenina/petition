const express = require("express");
const authRouter = express.Router();
const { hash, compare } = require("../bc");
const db = require("../db");

authRouter.get("/register", (req, res) => {
    console.log("user see a register page");

    if (req.session?.user_id) {
        return res.redirect("/");
    } else {
        res.render("register", {
            layout: "main",
        });
    }
});

authRouter.post("/register", (req, res) => {
    //here we recieve user data to register
    hash(req.body.password)
        .then((hashedPw) => {
            console.log(
                "POST/register i want to add this in db",
                req.body.first,
                req.body.last,
                req.body.email
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
            const handledError = registerErrorHandling(err);
            res.render("register", {
                layout: "main",
                error: handledError,
            });
            console.log("POST/register error ", err);
        });
});

function registerErrorHandling(err) {
    let detail = err.detail;
    console.log(typeof detail, detail);
    if (
        detail.startsWith("Key (email)") &&
        detail.endsWith("already exists.")
    ) {
        return { email: true };
    } else return {};
}
authRouter.get("/login", (req, res) => {
    if (req.session?.user_id) {
        res.redirect("/");
    } else {
        res.render("login", {});
    }
});

authRouter.post("/login", (req, res) => {
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
                res.render("login", {
                    layout: "main",
                    error: true,
                });
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
            // const error = {}
            res.render("login", {
                layout: "main",
                error: true,
            });
        });
});
module.exports.authRouter = authRouter;
