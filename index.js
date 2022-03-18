//https://codingshiksha.com/javascript/node-js-express-ffmpeg-mp3-pitch-and-tempo-changer-web-app-deployed-to-heroku-full-project-2020/

const express = require('express')

const multer = require('multer')
const download = require('download');
var admin = require("firebase-admin");
const { v4: uuidv4 } = require('uuid');

//kéne delete meg eleve a storageból kéne delete, meg valami security is, stb..

var serviceAccount = require("./buisnesprotect-firebase-adminsdk-8eyao-cdb1840a55.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://buisnesprotect-default-rtdb.europe-west1.firebasedatabase.app"
});

const storageRef = admin.storage().bucket(`gs://buisnesprotect.appspot.com`);
const path = require('path')

async function uploadFile(path, filename) {

  // Upload the File
  const storage = await storageRef.upload(path, {
      public: true,
      destination: `${filename}`,
      metadata: {
          firebaseStorageDownloadTokens: uuidv4(),
      }
  });


  return storage[0].metadata.mediaLink;
}



const fs = require('fs')

var pitch

var tempo

const bodyParser = require('body-parser')

const { exec } = require('child_process')

var outputFilePath = Date.now() + "output.mp3"

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

var dir = "public";
var subDirectory = "public/uploads";

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);

  fs.mkdirSync(subDirectory);
}

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const audioFilter = function (req, file, cb) {
  // Accept videos only
  if (!file.originalname.match(/\.(mp3)$/)) {
    req.fileValidationError = "Only audio files are allowed!";
    return cb(new Error("Only audio files are allowed!"), false);
  }
  cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: audioFilter })

app.use(express.static("public"));


const PORT = process.env.PORT || 3000

app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Access-Control-Allow-Origin');

  next()
});

app.post('/changepitch', async (req, res) => {
  console.log("something landed here")
  console.log(req.body)

  // File URL
  const url = req.body.url;

  // Download the file
  await download(url, './public');
  //  corsHandler(req, res, () => {
  if (req.body) {
    //heroku pw is: asdqasda1.
    pitch = 0.75
    console.log(pitch)
    console.log(tempo)
    const location = "public/" + req.body.riportID + "audio"
    exec(`ffmpeg -i ${location} -af asetrate=44100*${pitch},aresample=44100 ${outputFilePath}`,
      async (err, stdout, stderr) => {
        if (err) throw err
        res.setHeader('Access-Control-Allow-Origin', '*');
        //set up manually
        console.log("going to send")
        const downloadURL = await uploadFile("./"+outputFilePath,req.body.riportID)
        console.log(downloadURL)
        fs.unlinkSync(location)
        fs.unlinkSync(outputFilePath)
        res.json({downloadURL:downloadURL})
        console.log("we are done")
        
      })
  }
});
//})

app.listen(PORT, () => {
  console.log(`App is listening on Port ${PORT}`)
})