require('dotenv').config();
// index.js
// where your node app starts
const bodyParser = require('body-parser');

const { parse } = require('url');
// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
const { type } = require('express/lib/response');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204
// Middleware to parse IP address from request headers
app.enable('trust proxy');
// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// Middleware to parse JSON bodies
app.use(express.json());
// Database to store original and short URLs
const urlDatabase = {};





const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
  if (err) {
      console.error('Error connecting to MongoDB:', err);
  } else {
      console.log('Connected to MongoDB successfully!');
  }
});
const UrlSchema = new mongoose.Schema({
  original_url: String,
  short_url: String
});

const Url = mongoose.model('Url', UrlSchema);


// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// Route handler for /api/:date?
app.get('/api/test1/:date?', (req, res) => {
  let dateInput = req.params.date;
  
  // If date parameter is empty, use current time
  if (!dateInput) {
      dateInput = new Date();
  } else {
      // Check if the date is a valid Unix timestamp
      if (!isNaN(dateInput) && isFinite(dateInput)) {
          // Convert Unix timestamp to milliseconds
          dateInput = new Date(parseInt(dateInput));
      } else {
          // If not a Unix timestamp, treat it as a date string
          dateInput = new Date(dateInput);
          
          // Check if the date is valid
          if (isNaN(dateInput.getTime())) {
              return res.json({ error: "Invalid Date" });
          }
      }
  }
  
  const unixTimestamp = dateInput.getTime();
  const utcString = dateInput.toUTCString();
  
  res.json({ unix: unixTimestamp, utc: utcString });
});


// Route handler for /api/whoami
app.get('/api/test2/whoami', (req, res) => {
  // Get client's IP address from request headers
  const ipAddress = req.ip;

  // Get preferred language from request headers
  const language = req.headers['accept-language'];

  // Get software information from request headers
  const software = req.headers['user-agent'];

  // Construct JSON response object
  const responseObject = {
      ipaddress: ipAddress,
      language: language,
      software: software
  };

  // Send JSON response
  res.json(responseObject);
});

// POST endpoint to shorten URL
app.post('/api/shorturl', (req, res) => {
  const url = req.body.url;
  console.log('Received URL:', url);
return
  // Validate URL format
  const parsedUrl = parse(original_url );
  if (!parsedUrl.hostname || !parsedUrl.protocol.startsWith('http')) {
      return res.status(400).json({ error: 'invalid url' });
  }

  // Check if hostname exists
  dns.lookup(parsedUrl.hostname, async (err) => {
      if (err) {
          return res.status(400).json({ error: 'invalid url' });
      }

      // Insert the URL into MongoDB
      try {
          const newUrl = new Url({ original_url: url });
          await newUrl.save();
          res.json({ original_url: original_url , short_url: newUrl._id });
      } catch (error) {
          console.error('Error inserting URL into MongoDB:', error);
          res.status(500).json({ error: 'server error' });
      }
  });
});

// Redirect endpoint
app.get('/api/shorturl/:short_url', async (req, res) => {
  const { short_url } = req.params;

  try {
      const url = await Url.findById(short_url);
      if (url) {
          res.redirect(url.original_url);
      } else {
          res.status(404).json({ error: 'short URL not found' });
      }
  } catch (error) {
      console.error('Error retrieving URL from MongoDB:', error);
      res.status(500).json({ error: 'server error' });
  }
});

// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});



// Listen on port set in environment variable or default to 3000
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
