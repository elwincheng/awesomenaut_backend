const express = require('express');
const fs = require('fs');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const app = express();

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

s3.putObject({
  Body: "helloWorld", 
  Bucket: "techtogether", 
  Key: "newfile.txt"
}).promise();