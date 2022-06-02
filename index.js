//https://codingshiksha.com/javascript/node-js-express-ffmpeg-mp3-pitch-and-tempo-changer-web-app-deployed-to-heroku-full-project-2020/

const express = require('express')
const download = require('download');
var admin = require("firebase-admin");
const { v4: uuidv4 } = require('uuid');

const partone= "cdb1840a555309aa3f6"
const parttwo="f7b3bd01be5c922684e0e"
const pkid=partone+parttwo

var serviceAccount = {
  "type": "service_account",
  "project_id": "buisnesprotect",
  "private_key_id": pkid,
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDB//7OOLw4X3L0\nmqJV/nx8fMddOQz7JAlOI3WvYyyYLIJpJLap+G4f29BXJnoXtpF3+i8LqoNmz9lV\nGd6IUmy5cu+3HnTkMIQWgk2CS6LSMnak5r5BwY6JGA4D71en6Q4QDdYgbL+Sjpx3\nHDbFKHMToXGIXv/7U9c7/duetSqfktgf/SOvrOy+YvIzec/p2jj77T/7ePaI+WKa\nFl9gc/iq1Zn+hlCJqyaMNI9/+y4KORVx3fm4HgAggDfn0EmQdIqA1UmyLb7/gJLL\nDNRhRTaeqHcwaVgLWhHup2GB1rxJueKyE02eDJ26MybbAE6EHnNsm//+ox9HiRvC\naMoNTdGzAgMBAAECggEACXxfdKzwgx8jq1MuUd8eLiYZx3SlLlh+Pfxc4kUKpqwy\nejqp1djIZbVlVAWVHbi3FzM7/qmJQEs0eMVJjMfe+hhlIUKTe57lroYTjSXuobGG\n/JwtvGBe/FQZR1b6JcMvBVjv2ekHWv6vJuHRycUnD1QrDXx7rsnUMeJBTVrVaTT6\nobthqZkhEaozRX2XjmIFN86Ml7M2Sq/kgyc8aivgSxNWsfs+ypdMDTDDJ8On6QlZ\nXRBNEuH2R4ZhRTqNHKJA6ggCgxRFzOIObbDbEzZpXOe4JcAGsIqJpqt1zTZVPU03\nLDrOPW+wwvIU4dXKKJrV9YPNn4syLilsBluv9oqtYQKBgQDhvDcw+MLhTJTo7jsW\npFIhsHegkhUv2xyCHtzvbsV4mdDuFqBqHINY+ikr8vLtUSkQOTl9IbWvjhW5uiWI\nI3KEZnb0JCKBUV9zJQC5b4HxKv8c9048yT6y9yEuhSHrTighxXQsB6l7GUhOO0qW\n3Ait53UO+pOnOspdCFd5k85lkwKBgQDcAoyEbmSUOop/DLIJrjfgL6Mgc0V/06zE\nwbSUI/zVOwdTfA3xJPhMZKSqaL0GT0VGBGICWECEijb7UFAEE8i9lQrEq+YuxMn7\nMzncET1VZ26hfDzS6iHoCZwhcCIbRHhuZ5xB9mryzhEBnOZo0N4+mg/Njtb4cMvU\n6ciXRtZ3YQKBgQCdgxn33/0L/MYDawhsGij9PQecUZLbG8devG5p3B+KsbnqCHvS\nzyaP1a8Y7aO5GOLQYT3OJNGEOF7MhClgP2vPGzhxzy0Mk11JGU7SFg7T26675Y0A\nOWS4uFy8+0TZzmWOexs/BfGq5c9gV1sKvWqI/nLeCtcw34MJO6LeQNbKZQKBgQDO\n9urfDcY6FtQAbp3xM13G3KlVNnrzo9nMAfjwvuXyZSQgKfwnlEKsAqVQ1VS0Yc/l\n7OuSDxkqVachRUzwePgHN/S4TIkuB9uGHotYdTNAaxuMeAXz12LsGFYysnyzL/cm\nzPsWpku3e5hN7x5lDc90DpO9KJkbf2iQMxiLDo1kIQKBgBxLzDTmbomFS3yNtSHK\nGtBBOkn7lVrgO+CzOrbnueyP/HV0ia6xSxjlukZLmUnOCBWCctm9ag/+rN9mrex2\n4vcWbjog2jOT7aK79kR99c2hWW6UdFJPYDrNS1I6A/7W7TreZd2tBwZw1hsup5b2\neIfumlj+W+n6Az6+ykNRmcQ8\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-8eyao@buisnesprotect.iam.gserviceaccount.com",
  "client_id": "117249118587371111283",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-8eyao%40buisnesprotect.iam.gserviceaccount.com"
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://buisnesprotect-default-rtdb.europe-west1.firebasedatabase.app"
});

const storageRef = admin.storage().bucket(`gs://buisnesprotect.appspot.com`);

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

app.use(express.static("public"));

const PORT = process.env.PORT || 3000

app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Access-Control-Allow-Origin');
  next()
});

app.post('/changepitch', async (req, res) => {
  console.log("Endpoint triggered")
  console.log(req.body)

  // File URL
  const url = req.body.url;

  // Download the file
  try {
    await download(url, './public');
  } catch (error) {
    console.error("Error while downloading the file from: "+url)
    console.error(error)
  }
  if (req.body) {
    pitch = 0.75
    const location = "public/" + req.body.riportID + "audio"
    exec(`ffmpeg -i ${location} -af asetrate=44100*${pitch},aresample=44100 ${outputFilePath}`,
      async (err) => {
        if (err) throw err
        res.setHeader('Access-Control-Allow-Origin', '*');
        try {
          const downloadURL = await uploadFile("./"+outputFilePath,req.body.riportID)
          fs.unlinkSync(location)
          fs.unlinkSync(outputFilePath)
          res.json({downloadURL:downloadURL})
        } catch (error) {
          console.error("Error while uploading the file to storage")
          console.error(error)
        }
      })
  }
});

app.listen(PORT, () => {
  console.log(`App is listening on Port ${PORT}`)
})