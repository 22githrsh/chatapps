const mongoose = require("mongoose");

const serverSchema = mongoose.Schema({
    channlename :String,
    channledis :String ,
    admin:{type:mongoose.Schema.Types.ObjectId,ref:"user"},
    members:[{type:mongoose.Schema.Types.ObjectId, ref:'user',autopopulate: true}],
    textmsg:[{type:mongoose.Schema.Types.ObjectId, ref:'text-messges',autopopulate: true}],
    socketID:String
})

module.exports = mongoose.model("textchannle", serverSchema)