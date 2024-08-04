var express = require('express');
var router = express.Router();
var passport = require("passport")
const userModel = require("./users")
const serverModel = require("./servers");
const bodyParser = require('body-parser');
const textChannleModel = require("./textchannle")
const upload = require("./multer")
const localStratagy = require('passport-local');
passport.use(new localStratagy(userModel.authenticate()));
var ImageKit = require("imagekit");
const sendimageModel = require("./sendimages")

const io = require( "socket.io" )();
const socketapi = {
    io: io
};

const {searchfriend} = require("../Controllers/indexcontroller")
require("dotenv").config()

const fs = require("fs");
const { log } = require('console');
const { Socket } = require('socket.io');
var imagekit = new ImageKit({
  publicKey: "public_vAKZOB4IOY5IF8GLgw3sW4gf9rE=",
  privateKey: "private_6MDW09ufa0NhOpe9wQK+8AHJF88=",
  urlEndpoint:  "https://ik.imagekit.io/9aya5ihxfc",
});



router.get('/', isLoggedIn, async function (req, res, next) {
  if (!req.user) {
    return res.redirect("/login")
  }
  const user = await userModel.findById(req.user.id).populate("servers").populate("following")
  const messgaperson = await userModel.findById(req.user.id).populate('following')

  console.log(user);

  const servers = await serverModel.find()

  let creteserver = []
  servers.filter(single => {
    if (user.following.indexOf(single.servercreator)) {
      creteserver.push(single)
    }
  })
  // console.log(creteserver);

  res.render('index', { user, messgaperson, creteserver });

});

router.get('/register', function (req, res, next) {
  res.render('register');
});

router.get('/login', function (req, res, next) {
  res.render('login');
});


router.post('/register', function (req, res, next) {
  var newUser = new userModel({
    username: req.body.username,
    name: req.body.name,
    email: req.body.email,

  })
  userModel.register(newUser, req.body.password)
    .then(function (u) {
      passport.authenticate('local')(req, res, function () {
        res.redirect("/")
      })
    })
    .catch(function (e) {
      res.send(e);
    })
})


router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login'
}), function (req, res, next) { })


router.get('/logout', (req, res, next) => {
  if (req.isAuthenticated())
    req.logout((err) => {
      if (err) res.send(err);
      else res.redirect('/login');
    });
  else {
    res.redirect('/login');
  }
});


router.post('/profile', isLoggedIn, upload.single('image'), async function (req, res, next) {
  // const user = await userModel.findById(req.user.id)

  fs.readFile(req.file.path, function (err, data) {
    // console.log(data);
    if (err) throw err; // Fail if the file can't be read.
    imagekit.upload({
      file: data, //required
      fileName: req.file.filename, //required
      tags: ["tag1", "tag2"]
    }, async function (error, result) {
      if (error) console.log(error);
      else {
        var users = await userModel.findOneAndUpdate({ _id: req.user.id }, { profilepic: result.url })
        res.redirect("/")

      };
    });
  });
  // user.profilepic = req.file.filename
})

router.get("/sendfriends/:username", isLoggedIn, searchfriend)

router.get("/addfriends/:name", isLoggedIn, async function (req, res) {
  const user = await userModel.findById(req.user.id);

  const request = await userModel.findById(req.params.name)
  if (!request.follower.includes(user._id)) {
    request.follower.push(user._id)
    user.following.push(request._id)
    await user.save()
    await request.save()
  }
  // console.log( user, request);

  res.json(user)
})

router.get("/remove/:name", isLoggedIn, async function (req, res) {
  const user = await userModel.findById(req.user.id);

  const request = await userModel.findById(req.params.name)
  if (request.follower.includes(user._id)) {
    request.follower.remove(user._id)
    user.following.remove(request._id)
    await user.save()
    await request.save()
  }
  // console.log( user, request);

  res.json(user)
})
router.get("/channle/:server", isLoggedIn, async (req, res, next) => {

  if (!req.user) {
    res.redirect("/login")
  }
  const user = await userModel.findById(req.user.id).populate("servers").populate("following")
  // console.log(req.params.server);
  const server = await serverModel.findById(req.params.server).populate("textchannels")
  // console.log(server);

  const servers = await serverModel.find()

  let creteserver = []
  servers.filter(single => {
    if (user.following.indexOf(single.servercreator)) {
      creteserver.push(single)
    }
  })
  // console.log(creteserver)
  // console.log(creteserver);
  res.render(`channle`, { user, server, creteserver });
})



router.post("/createserver", isLoggedIn, upload.single('img'), async (req, res, next) => {
  const user = await userModel.findById(req.user.id)


  fs.readFile(req.file.path, function (err, data) {
    // console.log(data);
    if (err) throw err; // Fail if the file can't be read.
    imagekit.upload({
      file: data, //required
      fileName: req.file.filename, //required
      tags: ["tag1", "tag2"]
    }, async function (error, result) {
      if (error) console.log(error);
      else {
        var user = await userModel.findOneAndUpdate({ _id: req.user.id }, { profilepic: result.url })

        const baby = await serverModel.create({
          serverimg: result.url,
          servername: req.body.servername,
          servercreator: user._id
        })
        user.servers.push(baby._id)
        await user.save();
        res.redirect(`/channle/${baby._id}`)
      };
    });
  })


})
// var currentRoute = window.location.pathname;
router.post("/createchannle", isLoggedIn, async (req, res, next) => {

  var channleid = req.headers.referer;
  channleid = channleid.split("/")
  channleid = channleid[channleid.length - 1]
  // console.log(channleid);
  const server = await serverModel.findById(channleid)

  const newTextChannle = await textChannleModel.create({
    channlename: req.body.channlename,
    channledis: req.body.channledis,
    admin: req.user.id
  })

  server.textchannels.push(newTextChannle._id)
  await server.save()

  res.redirect(`/channle/${channleid}`)
})

router.get("/addintochannle", isLoggedIn, async (req, res) => {


  var serverid = req.headers.referer;
  serverid = serverid.split("/")
  serverid = serverid[serverid.length - 1]
  // console.log("server ki is = " + serverid);

  // const server = await serverModel.findById(channleid)

  const details = req.query
  // console.log(details);

  const channle = await textChannleModel.findById(details.channle)

  if (!channle.members.includes(details.user)) {
    channle.members.push(details.user)
    await channle.save()
    res.json(channle)

  }
  else {
    res.json(channle)
  }
})


router.post('/', isLoggedIn, upload.single('sendimage'), function (req, res, next) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
  // io.on("connection", function( socket ) {
  //   socket.on("sendimagetorecciver", async reciver=>{
  //     const reciverhai = await userModel.findById(reciver)
  //     console.log("raskjlhdkajshdhkjas");
  //     console.log(reciverhai);
  //   })
  // })
  res.json(req.file);

})


router.get("/error", function(req, res, next){ 
  res.render("error")
})

router.all("*",  function (req, res, next) {  
  res.status(404).redirect("/error")
})


function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  else {
    res.redirect('/login')
  }
}


module.exports = router;
