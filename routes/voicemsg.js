const mongoose = require("mongoose")

const msgschema = mongoose.Schema({
    msg :String,
    time :String,
    sender :{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    reciver:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    }

})

module.exports = mongoose.model("msg", msgschema)