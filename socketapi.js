const io = require( "socket.io" )();
const socketapi = {
    io: io
};
const userModel = require("./routes/users")
const msgModel = require("./routes/msg")
const textchannleModel = require("./routes/textchannle")

// Add your socket.io logic here!
io.on( "connection", function( socket ) {
    console.log( "A user connected" );

    socket.on("newuser", async currentuser=>{
        // console.log(currentuser)
        const user = await userModel.findById(currentuser)
        console.log(user);

        user.socketId = socket.id

        await user.save();

        socket.broadcast.emit("newuserishere",{
            name: user.name, 
            userid:user._id,
            profile:user.profilepic
        })


        const onlineuser = await userModel.find({
            socketId: {$nin: [""]},
            name:{$nin:[user.name]}

        })
        // console.log(onlineuser);
        onlineuser.forEach(singleuser=>{
            socket.emit("newuserishere", {
                name: singleuser.name,
                userid :singleuser._id,
                profile:singleuser.profilepic
            })
        })

        socket.on("imagemsg", imagePath=>{
            
        })
        socket.on("sendermsg",  async msginfo=>{
            const msgs = await msgModel.create({
                msg:msginfo.msg,
                sender:msginfo.currentuser,
                reciver:msginfo.reciver
            })
    
            var forreciver = await userModel.findById(msginfo.reciver)
    
            await msgs.save()

            if(!forreciver){
                const channle = await textchannleModel.findById(msginfo.reciver);
                // console.log(channle);


            // 
                channle.members.forEach(singleuser=>{
                    socket.to(singleuser.socketId).emit('group-message', msginfo.msg)
                })
            //    
                if(!channle) return;
            }
    
            if(forreciver){

                socket.to(forreciver.socketId).emit("recivermsg", msginfo.msg)
            }
            
        })
        // console.log(onineuser);
        await user.save()
        // console.log(user);

        socket.on("getallchats", async allmsg=>{
            // console.log(allmsg);
            const user = await userModel.findById(allmsg.reciver)

            if(user){
                const allMessage = await msgModel.find({
                    $or: [{
                        sender: allmsg.currentuser,
                        reciver: allmsg.reciver
                    },
                    {
                        sender: allmsg.reciver,
                        reciver: allmsg.currentuser
                    }]
                })
        
                // console.log(allMessage);
                socket.emit("allchats", allMessage)

            }else{
                const allmessages = await msgModel.find({reciver: allmsg.reciver})
                socket.emit("onlychat", allmessages)

                // console.log(allmessages);
            }
        })
    
    })


});
// end of socket.io logic

module.exports = socketapi;