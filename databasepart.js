import mongoose from "mongoose";
import User from "./models/user.js";

const createuser = async (username, mailid, passcode) => {
  const user = await User.create({
    username,
    mailid,
    password: passcode,
  });
  console.log(user);
};

const finduser = async (username) => {
  return await User.findOne({ username: username }).lean();
};

const updateuser = async (id, plan_type, amount, valid_for, expires_at) => {
  return await User.findByIdAndUpdate(
    { _id: id },
    {
      subscription_detail: {
        plan_type,
        amount,
        valid_for,
      },
      expires_at,
    }
  );
};

export { createuser, finduser, updateuser };
