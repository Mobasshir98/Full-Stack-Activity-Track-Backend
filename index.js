require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const userinfo = require("./Models/userinfo");
const userdata = require("./Models/userdata");
const isvalid = require("./utility/utility");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const app = express();

mongoose
  .connect("mongodb://localhost/todoList")
  .then(() => console.log("Connected to Data"));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const unProtectedRoutes = ["/login", "/register"];
app.use((req, res, next) => {
  if (unProtectedRoutes.includes(req.url)) {
    next();
  } else {
    if (req.headers.token) {
      jwt.verify(req.headers.token, process.env.SECRET_KEY, (err, username) => {
        if (err) {
          return res.sendStatus(403);
        }
        req.username = username;
        next();
      });
    } else {
      res.send("Authorization required");
    }
  }
});

app.post("/register", async (req, res) => {
  let { username, password, cmpassword } = req.body;
  if (await isvalid(username)) {
    if (password == cmpassword) {
      const user = await userinfo({
        username,
        password,
      });
      await user.save();
      res.status(200).send("User Added Successfully");
    } else {
      res.status(400).send("Password didn't Match");
    }
  } else {
    res.status(400).send("User Already Exists");
  }
});
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  userinfo
    .findOne({ username })
    .then((data) => {
      bcrypt.compare(password, data.password).then((val) => {
        if (val) {
          const authtoken = jwt.sign({ username }, process.env.SECRET_KEY);
          res.status(200).send(authtoken);
        } else {
          res.status(400).send("Invalid Details");
        }
      });
    })
    .catch(() => res.status(400).send("Invalid Details"));
});
app.post("/post", async (req, res) => {
  let { activity } = req.body;
  const username = req.username.username;
  let newdata = { activity };
  let ispresent = await userdata.find({ username: username });
  if (ispresent.length > 0) {
    userdata
      .updateOne({ username: username }, { $push: { data: { activity } } })
      .then(() => res.status(200).send("List Updated"));
  } else {
    userdata
      .create({
        username: username,
        data: [newdata],
      })
      .then((data) => res.status(200).send(data))
      .catch((err) => res.status(400).send(err));
  }
});

app.get("/post", async (req, res) => {
  const username = req.username.username;
  userdata.find({ username }).then((data) => {
    const newdata = data.map((d) => d.data);
    res.status(200).send(...newdata);
  });
});

app.get("/username", async (req,res)=>{
  let username=req.username.username
  userinfo.findOne({usernam:username}).then((data)=>{res.status(200).send(data);})
})

app.put("/put", async (req, res) => {
  let { id, time_Taken } = req.body;
  console.log(id, time_Taken)
  userdata.update(
    { "data._id": id },
    {
      $set: {
        "data.$.timeTaken": time_Taken,
        "data.$.status": "Completed",
      },
    }
  ).then((data)=>res.status(200).send(data));
});
app.listen(5000, () => console.log("Connected to Server"));
