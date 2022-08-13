const mongoose = require("mongoose")

const data = new mongoose.Schema({
   activity:{type:String,required:true},
   status:{type:String,default:'Pending' },
   timeTaken:{type:String}
})

const userdata = new mongoose.Schema({
    username:{type:String,required:true},
    data:[data]
})

const userdatamodel = mongoose.model("UserData", userdata)

module.exports=userdatamodel