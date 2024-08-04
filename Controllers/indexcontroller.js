const userModel = require("../routes/users")

exports.searchfriend = async (req, res, next) => {
    try {
        const name = req.params.username;
        // console.log(name);
        // console.log(req.user._id);
        let findAllUser = await userModel.find({_id : {$nin:[req.user._id]}})
        // console.log(findAllUser);
        let newusers = findAllUser.filter((charcter) => {
           return charcter.username.includes(name)
        })
        console.log(newusers);
        return res.json(newusers)

    } catch (error) {
        console.log(error.message);

    }

}