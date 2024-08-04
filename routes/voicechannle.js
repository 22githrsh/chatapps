const { default: mongoose } = require("mongoose");

const serverSchema = mongoose.Schema({
    servername :String,
    serverdis :String ,
    admin:{type:mongoose.Schema.Types.ObjectId,ref:"user"},
    members:[{type:mongoose.Schema.Types.ObjectId, ref:'user',autopopulate: true}],
    voicemsg:[{type:mongoose.Schema.Types.ObjectId, ref:'voice-messges',autopopulate: true}]
})

module.default = mongoose.model("voicechannle", serverSchema)