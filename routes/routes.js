const express = require("express");
const router = express.Router();
const user = require("../models/users");
const multer = require("multer");
const fs = require("fs");

// image upload
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

let upload = multer({
  storage: storage,
}).single("image");

// insert an user into database route
router.post("/add", upload, (req, res) => {
  // console.log(req.body);
  const User = new user({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    image: req.file.filename,
  });
  User.save((err) => {
    if (err) {
      res.json({ message: err.message, type: "danger" });
    } else {
      req.session.message = {
        type: "success",
        message: "user added successfully!",
      };
      res.redirect("/");
    }
  });
});

// Get all users route
router.get("/", (req, res) => {
  user.find().exec((err, users) => {
    if (err) {
      res.json({ message: err.message });
    } else {
      res.render("index", { title: "Home Page", users: users });
    }
  });
});

router.get("/", (req, res) => {
  res.render("index", { title: "Home Page" });
});

//  Creating Add Users route
router.get("/add", (req, res) => {
  res.render("add_users", { title: "Add Users" });
});

// Creating Edit an user route
router.get("/edit/:id", (req, res) => {
  let id = req.params.id;
  user.findById(id, (err, user) => {
    if (err) {
      res.redirect("/");
    } else {
      if (user == null) {
        res.redirect("/");
      } else {
        res.render("edit_user", { title: "Edit User", user: user });
      }
    }
  });
});

// Creating Update user route
router.post("/update/:id", upload, (req, res) => {
  let id = req.params.id;
  let new_image = "";

  if (req.file) {
    new_image = req.file.filename;
    try {
      fs.unlinkSync("./uploads/" + req.body.old_image);
    } catch (err) {
      console.log(err);
    }
  } else {
    new_image = req.body.old_image;
  }

  user.findByIdAndUpdate(
    id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.image,
      image: new_image,
    },
    (err, result) => {
      if (err) {
        req.json({ message: err.message, type: "danger" });
      } else {
        req.session.message = {
          type: "success",
          message: "User updated successfully",
        };
        res.redirect("/");
      }
    }
  );
});

// Delete user route
router.get("/delete/:id", (req, res) => {
  let id = req.params.id;
  user.findByIdAndDelete(id, (err, result) => {
    if (result.image != "") {
      try {
        fs.unlinkSync("./uploads/" + result.image);
      } catch (err) {
        console.log(err);
      }
    }
    if (err) {
      res.json({ message: err.message });
    } else {
      req.session.message = {
        type: "success",
        message: "User deleted successfully!",
      };
      res.redirect("/");
    }
  });
});

module.exports = router;
