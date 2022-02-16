import bcrypt from "bcryptjs";
import Jwt from "jsonwebtoken";
import "dotenv/config";
const JWT_secret = process.env.JWT_secret;

import { createuser, finduser, updateuser } from "./databasepart.js";
import { findexpirydate, issubscriptioncrossed } from "./dayscalculation.js";

const authorization = (req, res, next) => {
  const token = req.cookies.jwt_token;

  if (!token) res.sendStatus(403);
  try {
    const data = Jwt.verify(token, JWT_secret);
    req.id = data.id;
    req.username = data.username;
    return next();
  } catch {
    res.sendStatus(403);
  }
};

const issubscriptionthere = (user) => {
  if (!user.subscription) {
    return res.json({ status: "no subscription added" });
  }
};

const homepagefunc = async (req, res) => {
  const user = await finduser(req.username);
  console.log(user.expires_at);
  if (!user.subscription_detail) {
    return res.json({ status: "no subscription added" });
  }
  const yes = await issubscriptioncrossed(user);
  if (yes === 1) {
    return res.json({ status: "subscription expired" });
  }
  return res.json({ status: "you have subscription" });
};

const signupfunc = async (req, res) => {
  const { username, mailid, password } = req.body;
  if (!username || !mailid || !password)
    return res.json({ status: "error", error: "enter all required fields" });

  if (password.length < 5) {
    return res.json({
      status: "error",
      error: "enter password more than 5 characters",
    });
  }

  const passcode = await bcrypt.hash(password, 10);

  try {
    createuser(username, mailid, passcode);
    return res.json({ status: "user created" });
  } catch (error) {
    if (error.code === 11000) {
      return res.json({ status: "error", error: "Username already in use" });
    }
    throw error;
  }
};

const loginfunc = async (req, res) => {
  const { username, mailid, password } = req.body;
  if (!username || !password || !mailid)
    return res.json({ status: "error", error: "enter all fields" });

  const user = await finduser(username);

  if (!user)
    return res.json({
      status: "error",
      error: "invalid username or username doesnot exist",
    });

  if (mailid !== user.mailid)
    return res.json({ status: "error", error: "invalid mailid " });

  try {
    await bcrypt.compare(user.password, password);
    const token = Jwt.sign(
      {
        id: user._id,
        username: user.username,
        mailid: user.mailid,
      },
      JWT_secret
    );

    return res.cookie("jwt_token", token).json({ status: "user logged in" });
  } catch (error) {
    console.log(error);
    return res.json({ status: "error", error: "error occured" });
  }
};

const logoutfunc = async (req, res) => {
  res.cookie("jwt_token", "", { maxAge: 1 });
  return res.json({ status: "loggedout" });
};

const subscriptionfunc = async (req, res) => {
  const { plan_type, amount, valid_for } = req.body;
  const expires_at = await findexpirydate(valid_for);
  const id = req.id;
  try {
    const updateduser = await updateuser(
      id,
      plan_type,
      amount,
      valid_for,
      expires_at
    );
    return res.json({
      status: `got your subction and valid till ${expires_at}`,
    });
  } catch (error) {
    console.log(error);
    return res.json({ status: "not subscription added" });
  }
};

export {
  signupfunc,
  loginfunc,
  logoutfunc,
  authorization,
  subscriptionfunc,
  homepagefunc,
};
