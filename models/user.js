import mongoose from 'mongoose'
const schema=new mongoose.Schema({
    username:{type:String, required:true, unique:true},
    mailid:{type:String,required:true,unique:true},
    password:{type:String},
    subscription_detail:{
        plan_type:{type:String},
        amount:{type:String},
        valid_till:{type:String}
    },
    expires_at:{type:String}
})

const User=mongoose.model("users",schema)
export default User
