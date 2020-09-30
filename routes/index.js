let express = require("express");
let router = express.Router();
let User = require("../models/user");
let passport = require("passport");
const {
    request
} = require("express");
// The GET Section
router.get("/", (req, res) => {
    res.render("landing");
});

//=======================
//Auth Routes

//Show register form
router.get("/register", (req, res) => {
    res.render("register");
});

//handle signup logic
router.post("/register", (req, res) => {
    let newUser = new User({
        username: req.body.username,
    });
    let password = req.body.password;
    if (req.body.InvitationCode != process.env.INVITE_CODE) {
        req.flash("error", "Invalid invitation code! Please contact admin.");
        return res.redirect('back');
    }
    User.register(newUser, password, (err, user) => {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function () {
            req.flash(
                "success",
                "Welcome to Collection of Links! " + user.username
            );
            res.redirect("/links");
        });
    });
});

//show login form
router.get("/login", (req, res) => {
    res.render("login");
});

//handle login logic
router.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/links",
        failureRedirect: "/login",
    }),
    (req, res) => {}
);

//logout route
router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success", "Log You Out!");
    res.redirect("/login");
});

module.exports = router;