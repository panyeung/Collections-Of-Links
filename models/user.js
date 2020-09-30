const mongoose = require("mongoose");
let passportLocalMongoose = require("passport-local-mongoose");
let UserSchema = new mongoose.Schema({
    userName: String,
    password: String,
    isAdmin: {
        type: Boolean,
        default: false
    }
});

// add the plugin
UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", UserSchema)