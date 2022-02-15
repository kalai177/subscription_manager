import express, { response } from "express";
import path from "path/posix";
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Jwt  from "jsonwebtoken";
import cookieParser from "cookie-parser"
const JWT_secret="bnqduILLWQIOXJSORIUQIEEmcoierwq$%^U&*()dseurjaqkwuie"

const app=express();
const url="mongodb+srv://KALAIYARASI:Y5ZETyjBJfmcxo@subscriptiondb.9gpr6.mongodb.net/subscriptiondb?retryWrites=true&w=majority"
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
const port = process.env.PORT || 3000;

import User from "./models/user.js";


app.use(cookieParser());

// authorization

const authorization = (req, res, next) => {
  const token = req.cookies.jwt_token;

  if (!token) res.sendStatus(403);
  try {
    const data = Jwt.verify(token, JWT_secret);
    req.id=data.id
    req.username=data.username
    return next();
  } catch {
    res.sendStatus(403);
  }
};


// home page after loging in

app.get("/users/home", authorization, express.json(), async(req,res)=>{
  const user_data=await User.find({username:req.username}).exec();
  console.log(user_data);
  const thisdate= new Date().toLocaleDateString()
  if(!user_data.expires_at){
    return res.json({status:"no subscription added"})
  }
  
  else if(thisdate.localeCompare(user_data.expires_at)){
          try{
            const updatedata=await User.findByIdAndUpdate(req.id,{
              subscription_detail:NULL,
              expires_at:NULL
            })
             return res.json({status:"ur plan got expired"})
          }
          catch(error){
            console.log(error)
            return res.json({status:"error", error:error})
          }
  }
  else
   return res.json({status:"ok"})
})




//users signup function

app.post("/users/signup",express.json(),async(req,res)=>{
    const{username,mailid,password}=req.body;
    if(!username || !mailid || !password){
        return res.json({status:"error",error:"please enter all the required fields"})
    }
    if(password.length<5){
        return res.json({status:"error",error:"enter password more than 5 characters"})
    }

    const hashedpassword= await bcrypt.hash(password,10);
    try{
        const data=await User.create({
            username,
            mailid,
            password:hashedpassword,
        })
        console.log(data);
        return res.json({status:"ok"})
    }
    catch(error){
      if (error.code === 11000) {
        return res.json({ status: "error", error: "Username already in use" });
      }
      throw error;
    }
})

//users login function

app.post("/users/login",express.json(),async(req,res)=>{
  const{username,mailid,password}=req.body;
  if(!username || !mailid || !password){
    return res.json({status:"error",error:"enter all the required fields"});
  }
    const data=await User.findOne({username}).lean()
   if(!data){
     return res.json({status:"error",error:"invalid username or username doesnot exist"})
   }

   if(data.mailid !==mailid || data.username!==username){
     return res.json({status:"error",error:"invalid username or mailid"})
   } 
   console.log(data.username)
   console.log(data.hashedpassword);
  
   try{
    await bcrypt.compare(password,data.password)
       const token= Jwt.sign({
         id:data._id,
         username:data.username,
         maildid:data.mailid
       },
       JWT_secret
       )
       return res
       .cookie("jwt_token",token)
       .json({status:"ok"})

   }
   catch(error)
   {
     console.log(error);
     return res.json({status:"error",error:"password incorrect"})
   }
})

//logout 

app.get("/users/logout",express.json(),(req,res)=>{
  res.cookie("jwt_token",' ',{maxAge:1})
  res.redirect("/")
})


// subscription
app.put("/users/subscription", authorization,express.json(),async(req,res)=>{
  const{plan_type,amount,days}=req.body;
  const id=req.id
  const futuredate=new Date();
  const valid_days=parseInt(days)
  futuredate.setDate(futuredate.getDate() +valid_days);
  const valid_till=futuredate.toLocaleDateString()
  try{
    const user_data=await User.findByIdAndUpdate(id,{
      subscription_detail:{
     plan_type:plan_type,
     amount:amount,
     valid_for:days
      },
     expires_at:valid_till
    })
    console.log(user_data)
    return res.json({status:`got your subction and valid till ${valid_till}`})
  }
  catch(error){
    console.log(error)
    return res.json({status:"error",error:error})
  }
})






app
  .listen(port, function () {
    console.log("success http://localhost:3000/");
  })
  .on("error", function (error) {
    console.log(error);
  });
