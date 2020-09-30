const mongoose = require("mongoose");

//Schema Setup
let linkSchema = new mongoose.Schema({
    name: String,
    image: String,
    url_link: String,
    imageId: String,
    description: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }
})

//Created a  model
let Link = mongoose.model("Link", linkSchema);

module.exports = Link;