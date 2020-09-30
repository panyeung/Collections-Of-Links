let express = require("express");
const Link = require("../models/link");
let router = express.Router();
let passport = require("passport");
const fetch = require("node-fetch");
const puppeteer = require("puppeteer");
let middleware = require("../middleware/index");
require("dotenv").config();
const { json } = require("body-parser");
const util = require("util");
const getUrls = require("get-urls");

//Image upload
var multer = require("multer");
var storage = multer.diskStorage({
  filename: function (req, file, callback) {
    callback(null, Date.now() + file.originalname);
  },
});
var imageFilter = function (req, file, cb) {
  // accept image files only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};
var upload = multer({
  storage: storage,
  fileFilter: imageFilter,
});

var cloudinary = require("cloudinary");
const { link } = require("fs");
cloudinary.config({
  cloud_name: "duwgrbabu",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//The INDEX Route - show all links
router.get("/links", middleware.isLogin, (req, res) => {
  //req.user give information about user
  //get all links from db
  Link.find({}, (err, allLinks) => {
    if (err) {
      console.log(err);
    } else {
      //Render the page and pass is the data
      res.render("index", {
        links: allLinks,
      });
    }
  });
});

//The form to created new link
//CREATE -show form add new links to db
router.get("/links/new", middleware.isLogin, (req, res) => {
  res.render("new");
});

//Show- show more info about one link
router.get("/links/:id", (req, res) => {
  //find the link with provided ID
  const id = req.params.id;
  Link.findById(id, (err, foundLink) => {
    if (err) {
      console.log(err);
    } else {
      if (!foundLink) {
        return res.status(400).send("Item not found.");
      }
      res.render("show", {
        link: foundLink,
      });
    }
  });
});

function cloudinaryPromise(shotResult) {
  return new Promise(function (res, rej) {
    cloudinary.v2.uploader
      .upload_stream({}, function (error, cloudinary_result) {
        if (error) {
          console.error("Upload to cloudinary failed: ", error);
          rej(error);
        }
        res(cloudinary_result);
      })
      .end(shotResult);
  });
}

const takeScreenshot = async (page) => {
  let shotResult = await page
    .screenshot()
    .then((result) => {
      return result;
    })
    .catch((e) => {
      req.flash("error", "unable to take the screenshot of the website");
      return false;
    });

  if (shotResult) {
    return cloudinaryPromise(shotResult).catch((err) => {
      return;
    });
  } else {
    return null;
  }
};

//Create new link
router.post("/links", middleware.isLogin, async (req, res) => {
  //Get data from form and add to the links page
  //req.user contain information about current user
  let name = req.body.name;
  let image = req.body.image;
  let description = req.body.description;
  let url_link = req.body.url_link;
  let imageId = "";
  let browser = await puppeteer.launch({
    //headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  let page = await browser.newPage();
  try {
    await page.goto(url_link, { waitUntil: "load", timeout: 0 });
    name = await getTitle(page);
    //Get screenshot
    await takeScreenshot(page).then((res) => {
      image = res.secure_url;
      imageId = res.public_id;
    });
    description = await getDescription(page);
  } catch (err) {
    req.flash("error", err.message);
    return res.redirect("/links");
  } finally {
    await browser.close();
  }

  let author = {
    id: req.user._id,
    username: req.user.username,
  };
  let newLink = {
    name: name,
    image: image,
    url_link: url_link,
    description: description,
    author: author,
    imageId: imageId,
  };

  //Create new link and save it to the database
  Link.create(newLink, (err, newLink) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/links");
    }
  });
});

//EDIT ROUTE
router.get("/links/:id/edit", middleware.checkOwner, (req, res) => {
  Link.findById(req.params.id, (err, foundLink) => {
    if (err) {
      req.flash("error", "Link not found!");
      res.redirect("/links");
    } else {
      if (!foundLink) {
        return res.status(400).send("Item not found.");
      }
      res.render("edit", {
        link: foundLink,
      });
    }
  });
});

//UPDATE ROUTE
router.put(
  "/links/:id",
  middleware.checkOwner,
  upload.single("image"),
  (req, res) => {
    Link.findById(req.params.id, async (err, link) => {
      if (err) {
        req.flash("error", err.message);
        res.redirect("back");
      } else {
        if (req.file) {
          try {
            if (link.imageId != "") {
              await cloudinary.v2.uploader.destroy(link.imageId);
            }
            //Upload the image
            let result = await cloudinary.v2.uploader.upload(req.file.path);
            //Update data
            link.imageId = result.public_id;
            link.image = result.secure_url;
          } catch (err) {
            req.flash("error", err.message);
            res.redirect("back");
          }
        }
        link.name = req.body.name;
        link.description = req.body.description;
        link.save();
        req.flash("success", "Successfully Updated!");
        res.redirect("/links/" + req.params.id);
      }
    });
  }
);

//Destroy Route
router.delete("/links/:id", middleware.checkOwner, (req, res) => {
  Link.findById(req.params.id, async (err, link) => {
    if (err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    if (req.params.imageId != "") {
      console.log("Inside the destroy");
      await cloudinary.v2.uploader.destroy(link.imageId).catch((err) => {
        req.flash("error", err.message);
        return res.redirect("back");
      });
    }
    link.remove();
    req.flash("success", "Link deleted successfully!");
    res.redirect("/links");
  });
});

//middleware check user ownership
function checkOwner(req, res, next) {
  //is user logged in?
  if (req.isAuthenticated()) {
    Link.findById(req.params.id, (err, foundLink) => {
      if (err) {
        res.redirect("back");
      } else {
        if (!foundLink) {
          return res.status(400).send("Item not found.");
        }
        //Does user own the link?
        //foundLink.author.id is mongoose object
        //req.user._id is string
        //need to use .equals to compare
        if (foundLink.author.id.equals(req.user._id)) {
          next();
        } else {
          //you do not own this link
          res.redirect("back");
        }
      }
    });
  } else {
    res.redirect("back");
  }
}

//Get Title
const getTitle = async (page) => {
  try {
    const title = await page.evaluate(() => {
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle != null && ogTitle.content.length > 0) {
        return ogTitle.content;
      }
      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (twitterTitle != null && twitterTitle.content.length > 0) {
        return twitterTitle.content;
      }
      const docTitle = document.title;
      if (docTitle != null && docTitle.length > 0) {
        return docTitle;
      }
      const h1 = document.querySelector("h1").innerHTML;
      if (h1 != null && h1.length > 0) {
        return h1;
      }
      const h2 = document.querySelector("h1").innerHTML;
      if (h2 != null && h2.length > 0) {
        return h2;
      }
      return null;
    });
    return title;
  } catch (err) {
    res.redirect("/links");
    return null;
  }
};

//Get Description
const getDescription = async (page) => {
  try {
    const description = await page.evaluate(() => {
      const ogDescription = document.querySelector(
        'meta[property="og:description"]'
      );
      if (ogDescription != null && ogDescription.content.length > 0) {
        return ogDescription.content;
      }
      const twitterDescription = document.querySelector(
        'meta[name="twitter:description"]'
      );
      if (twitterDescription != null && twitterDescription.content.length > 0) {
        return twitterDescription.content;
      }
      const metaDescription = document.querySelector(
        'meta[name="description"]'
      );
      if (metaDescription != null && metaDescription.content.length > 0) {
        return metaDescription.content;
      }
      paragraphs = document.querySelectorAll("p");
      let fstVisibleParagraph = null;
      for (let i = 0; i < paragraphs.length; i++) {
        if (
          // if object is visible in dom
          paragraphs[i].offsetParent !== null &&
          !paragraphs[i].childElementCount != 0
        ) {
          fstVisibleParagraph = paragraphs[i].textContent;
          break;
        }
      }
      return fstVisibleParagraph;
    });
    return description;
  } catch (err) {
    res.redirect("/links");
    return null;
  }
};

//Getting image
const getImg = async (page) => {
  const img = await page.evaluate(async () => {
    const ogImg = document.querySelector('meta[property="og:image"]');
    if (ogImg != null && ogImg.content.length > 0) {
      return ogImg.content;
    }
    const imgRelLink = document.querySelector('link[rel="image_src"]');
    if (imgRelLink != null && imgRelLink.href.length > 0) {
      return imgRelLink.href;
    }
    const twitterImg = document.querySelector('meta[name="twitter:image"]');
    if (twitterImg != null && twitterImg.content.length > 0) {
      return twitterImg.content;
    }

    let imgs = Array.from(document.getElementsByTagName("img"));
    if (imgs.length > 0) {
      imgs = imgs.filter((img) => {
        let addImg = true;
        if (img.naturalWidth > img.naturalHeight) {
          if (img.naturalWidth / img.naturalHeight > 3) {
            addImg = false;
          }
        } else {
          if (img.naturalHeight / img.naturalWidth > 3) {
            addImg = false;
          }
        }
        if (img.naturalHeight <= 50 || img.naturalWidth <= 50) {
          addImg = false;
        }
        return addImg;
      });
      return imgs[0].src;
    }
    return null;
  });
  return img;
};

module.exports = router;
