const express = require('express');
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const bodyParser = require('body-parser');

var serviceAccount = require("./lock.json");
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get('/loginup', function(req, res) {
  res.sendFile(path.join(__dirname, "loginup.html"));
});

app.post("/login_s", async function(req, res) {
  const { email, password } = req.body;
  try {
    const usersRef = db.collection('signup_s');
    const snapshot = await usersRef.where('email', '==', email).where('password', '==', password).get();
    
    if (snapshot.empty) {
      res.send('<script>alert("User authentication details do not match. Go back and re-enter correct details."); window.location.href = "/";</script>');
    } else {
      await db.collection('login_s').add(req.body);
      res.redirect('/main.html');
    }
  } catch (error) {
    console.error('Error checking document: ', error);
    res.status(500).send('Error checking login data');
  }
});

app.post("/signup_s", async function(req, res) {
  try {
    await db.collection('signup_s').add(req.body);
    res.send('<script>alert("Signup data saved successfully. Please login now."); window.location.href = "/";</script>');
  } catch (error) {
    console.error('Error adding document: ', error);
    res.status(500).send('Error saving signup data');
  }
});

app.get('/main.html', function(req, res) {
  res.sendFile(path.join(__dirname, "main.html"));
});

app.listen(99, () => {
  console.log("Server is running at http://localhost:99/");
});