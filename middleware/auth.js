function requireSigned(req, res, next) {
    if (!req.session?.sign_id) {
        return res.redirect("/");
    }
    next();
}

function requireNotSigned(req, res, next) {
    if (req.session?.sign_id) {
        return res.redirect("/");
    }
    next();
}

module.exports = {
    requireSigned,
    requireNotSigned,
};
