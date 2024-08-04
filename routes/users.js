const mongoose = require("mongoose")
require('dotenv').config({path : "./.env"})

const plm = require("passport-local-mongoose")

mongoose.set("strictQuery", false)
// if true karenga to mai iske alaw aor kuch nahi daal sakta
// or ager false hai to mai bahut cuhc daat skat ahun isme
mongoose.connect("mongodb://127.0.0.1:27017/Discord-try")

// mongoose.connect(process.env.MOGODB_CONNECT)

var userSchema = mongoose.Schema({
  username:String,
  name:String,
  email:String,
  socketId:String,
  follower:[
    {
      type : mongoose.Schema.Types.ObjectId,
      ref:"user",autopopulate: true
    }
  ],
  following:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:"user",autopopulate: true
    }
  ],
  profilepic:{
    default:"https://ik.imagekit.io/gunj6f9gb/gray-user-profile-icon-png-fP8Q1P.png?updatedAt=1710224268267",
    type:String
  },
  servers:[
    {
      type : mongoose.Schema.Types.ObjectId,
      ref:"server",autopopulate: true
    }
  ],
})

userSchema.plugin(plm)


module.exports = mongoose.model('user', userSchema)