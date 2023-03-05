const express = require('express');
require("dotenv").config();
const fsPromises = require('fs').promises;
const AWS = require('aws-sdk');
const bodyParser = require('body-parser');
const multer = require('multer')
const cors = require("cors");
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });
const upload = multer();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});
const app = express();

const whitelist = ['http://localhost:3000'];
const corsOptions = {
    origin: (origin, callback) => {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
}

app.use(cors(corsOptions));

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});

app.use(express.json());

app.use(bodyParser.urlencoded({ extended: true })); // For parsing form data

app.use(bodyParser.json()); // For parsing form data

// app.use(upload.array()); 
// app.use(express.static('public'));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Upload an image 
app.post("/post-image", async (req, res) => {
  console.log("here");
  // Obtain number of images
  let imageCount = 0;
  let data = await fsPromises.readFile("bucket_info.json");
  data = JSON.parse(data);
  imageCount = data.images;

  // Upload new image
  await s3.putObject({
    Body: JSON.stringify(req.body),
    Bucket: process.env.AWS_IMAGE_BUCKET_NAME,
    Key: `${imageCount+1}`
  }).promise();

  // Upload image labels
  await s3.putObject({
    Body: JSON.stringify(req.body),
    Bucket: process.env.AWS_IMAGE_LABELS,
    Key: `${imageCount+1}`
  }).promise()

  // Increment count of images and write back to file
  data.images = imageCount+1;
  await fsPromises.writeFile("bucket_info.json", JSON.stringify(data));
  res.sendStatus(200);
});

// Upload text 
app.post("/post-text", async (req, res) => {
  // Obtain number of text
  let textCount = 0;
  let data = await fsPromises.readFile("bucket_info.json");
  data = JSON.parse(data);
  textCount = data.text;

  // Upload new text
  await s3.putObject({
    Body: JSON.stringify(req.body),
    Bucket: process.env.AWS_TEXT_BUCKET_NAME,
    Key: `${textCount+1}`
  }).promise();

  // Upload text labels
  await s3.putObject({
    Body: JSON.stringify(req.body),
    Bucket: process.env.AWS_TEXT_LABELS,
    Key: `${textCount+1}`
  }).promise()

  // Increment count of text and write back to file
  data.text = textCount+1;
  await fsPromises.writeFile("bucket_info.json", JSON.stringify(data));
  res.sendStatus(200);
});

// Upload audio
app.post("/post-audio", async (req, res) => {
  // Obtain number of audio files
  let audioCount = 0;
  let data = await fsPromises.readFile("bucket_info.json");
  data = JSON.parse(data);
  audioCount = data.audio;

  // Upload new audio file
  await s3.putObject({
    Body: JSON.stringify(req.body),
    Bucket: process.env.AWS_AUDIO_BUCKET_NAME,
    Key: `${audioCount+1}`
  }).promise();

  // Upload audio labels
  await s3.putObject({
    Body: JSON.stringify(req.body),
    Bucket: process.env.AWS_AUDIO_LABELS,
    Key: `${audioCount+1}`
  }).promise()

  // Increment count of audio files and write back to file
  data.audio = audioCount+1;
  await fsPromises.writeFile("bucket_info.json", JSON.stringify(data));
  res.sendStatus(200);
});
