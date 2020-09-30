const Link = require("../models/link");
let middlewareObj = {};

middlewareObj.checkOwner = (req, res, next) => {
  //is user logged in?
  if (req.isAuthenticated()) {
    Link.findById(req.params.id, (err, foundLink) => {
      if (err) {
        req.flash("error", "Link not found!");
        res.redirect("back");
      } else {
        //check if the link is found
        if (!foundLink) {
          req.flash("error", "Item not found.");
          return res.redirect("back");
        }
        //Does user own the link?
        //foundLink.author.id is mongoose object
        //req.user._id is string
        //need to use .equals to compare
        if (foundLink.author.id.equals(req.user._id)) {
          next();
        } else {
          req.flash("error", "You do not have permission to that!");
          //you do not own this link
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "You need to be login to do that!")
    res.redirect("back");
  }
};

//middleware check is user login
middlewareObj.isLogin = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  //flash err message for the next request
  req.flash("error", "Please Login First");
  res.redirect("/login");
};

module.exports = middlewareObj;