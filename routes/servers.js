const mongoose =  require("mongoose");

const serverSchema = mongoose.Schema({
    serverimg:{
        default:"channels4_profile.jpg",
        type:String
    },
    servercreator:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    servername :String,
    textchannels :[{type:mongoose.Schema.Types.ObjectId,ref:"textchannle",autopopulate: true}],
    voicechannels :[{type:mongoose.Schema.Types.ObjectId,ref:"voicechannle",autopopulate: true}]
})

module.exports = mongoose.model("server", serverSchema)