const supertest = require("supertest");
const { app } = require("./server.js");
const cookieSession = require("cookie-session");
const { addSign } = require("./db.js");

jest.mock("./db.js");

// test("Sanity check", () => {
//     expect(1).toBe(1);
// });

test("Homepage functional", () => {
    return supertest(app)
        .get("/login")
        .then((res) => {
            expect(res.statusCode).toBe(200);
            expect(res.headers["content-type"]).toContain("text/html");
        });
});

//REDIRECT IF USER IS NOT LOGGED IN

test("U1 Redirect home to register if no CookieSesssion", () => {
    return supertest(app).get("/").expect(302).expect("location", "/register");
});
test("U2 Redirect petition to register if no CookieSesssion", () => {
    return supertest(app)
        .get("/petition")
        .expect(302)
        .expect("location", "/register");
});

test("U3 Redirect profile to register if no CookieSesssion", () => {
    return supertest(app)
        .get("/profile")
        .expect(302)
        .expect("location", "/register");
});
test("U4 Redirect profile to register if no CookieSesssion", () => {
    return supertest(app)
        .get("/profile")
        .expect(302)
        .expect("location", "/register");
});

test("U5 Redirect profile/edit to register if no CookieSesssion", () => {
    return supertest(app)
        .get("/profile/edit")
        .expect(302)
        .expect("location", "/register");
});

test("U6 Redirect signers to register if no CookieSesssion", () => {
    return supertest(app)
        .get("/signers")
        .expect(302)
        .expect("location", "/register");
});

test("U7 Redirect signers/city to register if no CookieSesssion", () => {
    return supertest(app)
        .get("/signers/Berlin")
        .expect(302)
        .expect("location", "/register");
});

//REDIRECT if user logged in but not signed

test("L1 Redirect / to petition if loged in but not signed", () => {
    cookieSession.mockSessionOnce({ user_id: 1 });
    return supertest(app).get("/").expect(302).expect("location", "/petition");
});

test("L2 Redirect /login to petition if loged in but not signed", () => {
    cookieSession.mockSessionOnce({ user_id: 1 });
    return supertest(app).get("/login").expect(302).expect("location", "/");
});

test("L3 Redirect /register to petition if logged in but not signed", () => {
    cookieSession.mockSessionOnce({ user_id: 1 });
    return supertest(app).get("/register").expect(302).expect("location", "/");
});

test("L4 Redirect /signers to petition if loged in but not signed", () => {
    cookieSession.mockSessionOnce({ user_id: 1 });
    return supertest(app).get("/signers").expect(302).expect("location", "/");
});
test("L5 Redirect /thanks to petition if loged in but not signed", () => {
    cookieSession.mockSessionOnce({ user_id: 1 });
    return supertest(app).get("/thanks").expect(302).expect("location", "/");
});

test("L6 Stay /profile if logged in but not signed", () => {
    cookieSession.mockSessionOnce({ user_id: 1 });
    return supertest(app).get("/profile").expect(200);
});

//need to mock db
// test("Stay /profile/edit if logged in but not signed", () => {
//     cookieSession.mockSessionOnce({ user_id: 1 });
//     return supertest(app).get("/profile/edit").expect(200);
// });

test("L7 Stay /petition if logged in but not signed", () => {
    cookieSession.mockSessionOnce({ user_id: 1 });
    return supertest(app).get("/petition").expect(200);
});

test("L8 Redirect to /thanks if logged user want to submit smth", () => {
    cookieSession.mockSessionOnce({ user_id: 1 });
    addSign.mockResolvedValueOnce({
        rows: [{ id: "22" }],
    });
    return supertest(app)
        .post("/petition")
        .send("signature=kdsjfjkl")
        .expect(302)
        .expect("location", "/thanks");
});

//for signed users

test("S1 Redirect /login to /thanks if logged in and signed", () => {
    cookieSession.mockSessionOnce({ user_id: 1, sign_id: 1 });
    return supertest(app).get("/login").expect(302).expect("location", "/");
});

test("S2 Redirect /register to /thanks if logged in and signed", () => {
    cookieSession.mockSessionOnce({ user_id: 1, sign_id: 1 });
    return supertest(app).get("/register").expect(302).expect("location", "/");
});
test("S3 Redirect / to /thanks if logged in and signed", () => {
    cookieSession.mockSessionOnce({ user_id: 1, sign_id: 1 });
    return supertest(app).get("/").expect(302).expect("location", "/thanks");
});
test("S4 Redirect /petition to /thanks if logged in and signed", () => {
    cookieSession.mockSessionOnce({ user_id: 1, sign_id: 1 });
    return supertest(app).get("/petition").expect(302).expect("location", "/");
});

test("S5 Redirect to /thanks if signed user want to submit smth", () => {
    cookieSession.mockSessionOnce({ user_id: 1, sign_id: 12 });
    // addSign.mockResolvedValueOnce({
    //     // rows[0].id
    //     rows: [{ id: "22" }],
    // });
    return supertest(app)
        .post("/petition")
        .send("signature=kdsjfjkl")
        .expect(302)
        .expect("location", "/");
});
