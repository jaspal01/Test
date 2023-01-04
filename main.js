// imports

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MemoryStore = require('memorystore')(session)

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 4000;

// Database Connection
mongoose.set("strictQuery", true);
console.log(process.env.DB_URL || "mongodb+srv://jaspal:jaspal123@cluster0.0lcwkyb.mongodb.net/test")
mongoose.connect("mongodb://jaspal:jaspal123@cluster0.0lcwkyb.mongodb.net:27017/test&authSource=admin");
const db = mongoose.connection;
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("Connected to database"));

// middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
  session({
    cookie: { maxAge: 86400000 },
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    secret: "my secret key",
    saveUninitialized: true,
    resave: false,
  })
);

app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});

app.use(express.static("uploads"));

// Set template Engines
app.set("view engine", "ejs");

// route prefix
app.use("", require("./routes/routes"));

app.use("/home", (req, res)=> {
  res.send("Done")
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
