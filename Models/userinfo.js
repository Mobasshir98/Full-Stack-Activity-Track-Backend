const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')

const userinfo = new mongoose.Schema({
    username:{type:String,required:true},
    password:{type:String,required:true}
})

userinfo.pre('save', async function(next){
    if(this.isModified("password")){
        this.password= await bcrypt.hash(this.password,10)
    }
    next()
})

const userinfomodel = mongoose.model("Userinfo",userinfo);
module.exports=userinfomodel;


