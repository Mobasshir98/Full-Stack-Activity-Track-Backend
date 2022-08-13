const mongoose = require("mongoose")
const userinfo=require("../Models/userinfo")

const isvalid=async (username)=>{
    const user = await userinfo.findOne({username:username});
    return user==null;
}

module.exports= isvalid;