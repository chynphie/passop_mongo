const express = require("express");
const dotenv = require("dotenv");
const { MongoClient } = require("mongodb");
const bodyparser = require("body-parser");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes"); // Adjust the path as needed
const mongoose = require('mongoose');

dotenv.config();
// Connection URL
const url = "mongodb://localhost:27017";
const client = new MongoClient(url);

// Database Name
const dbName = "passwop";
const app = express();
const port = 3000;
app.use(bodyparser.json());
app.use(cors());
app.use('/api/auth', authRoutes);

client.connect();

console.log("Connected successfully to server");
const db = client.db(dbName);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/passwop', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Failed to connect to MongoDB', err);
});

// get all the passwords
app.get("/", async (req, res) => {
  const collection = db.collection("passwords");
  const findResult = await collection.find({}).toArray();
  res.json(findResult);
});

// save a password
app.post("/", async (req, res) => {
  const password = req.body;
  const db = client.db(dbName);
  const collection = db.collection("passwords");
  const findResult = await collection.insertOne(password);
  res.send({ sucess: true, result: findResult });
});
// delete a password
app.delete("/", async (req, res) => {
  const password = req.body;
  const db = client.db(dbName);
  const collection = db.collection("passwords");
  const findResult = await collection.deleteOne(password);
  res.send({ sucess: true, result: findResult });
});

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
