import express from "express";
import path from "path/posix";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
const port = process.env.PORT || 3000;
const app = express();
app.use(cookieParser());
app.use(express.json());

// establishing mongodb connection

const url =
  "mongodb+srv://KALAIYARASI:Y5ZETyjBJfmcxo@subscriptiondb.9gpr6.mongodb.net/subscriptiondb?retryWrites=true&w=majority";
const connectionParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
mongoose
  .connect(url, connectionParams)
  .then(() => {
    console.log("Connected to database ");
  })
  .catch((err) => {
    console.error(`Error connecting to the database. \n${err}`);
  });

//mongoose connection over

import {
  signupfunc,
  loginfunc,
  logoutfunc,
  authorization,
  subscriptionfunc,
  homepagefunc,
} from "./logicpart.js";

app.post("/users/signup", express.json(), signupfunc);
app.post("/users/login", express.json(), loginfunc);
app.get("/users/logout", express.json(), logoutfunc);
app.put("/users/subscription", express.json(), authorization, subscriptionfunc);
app.get("/users/home", authorization, express.json(), homepagefunc);

app
  .listen(port, function () {
    console.log("success http://localhost:3000/");
  })
  .on("error", function (error) {
    console.log(error);
  });
