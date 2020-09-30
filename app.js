//Included express
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
// mongoose is a js that allow us interact with mongodb
const mongoose = require("mongoose");
const port = process.env.PORT || 3000;
//Connect flash for user message
const flash = require("connect-flash");
//passport
const passport = require("passport");
const LocalStrategy = require("passport-local");
const expressSession = require("express-session");
User = require("./models/user.js");
//getting the link schema
let Link = require("./models/link");
//for update and destroy
const methodOverride = require("method-override");
//require routers
let linkRoute = require("./routes/links"),
  indexRoutes = require("./routes/index");

console.log(process.env.DATABASEURL);
//Connect to the db
mongoose.connect(process.env.DATABASEURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//custom style sheet
app.use(express.static(__dirname + "/public"));
//methodOverride
app.use(methodOverride("_method"));

//app.use(bodyParser.json()); // for parsing application/json
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
); // for parsing application/x-www-form-urlencoded
//app.use(multer()); // for parsing multipart/form-data
//Passport Configuration
//This secret will be use to encode and decode the session
//makesure to require express-session
app.use(
  expressSession({
    secret: "I am Pan",
    resave: false,
    saveUninitialized: false,
  })
);
//setting passport
app.use(passport.initialize());
app.use(passport.session());

//tell app to use connect-flash
app.use(flash());

//set view engine
app.set("view engine", "ejs");

//responsible for reading the session, encoding and
//decoding the session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new LocalStrategy(User.authenticate()));

//this middleware allow current user to display
// in all page
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  //store message so it is define in every page.
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

//using the router
app.use(indexRoutes);
app.use(linkRoute);

//Starting the server
app.listen(port, () =>
  console.log(
    `Express started on http://localhost:${port}; ` +
      `press Ctrl-C to terminate.`
  )
);
