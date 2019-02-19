//import environment variables
const envs = require('dotenv').config();

//express configuration
const express = require('express');
const app = express();
const port = process.env.SERVER_PORT;

//dependencies
const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

//server routes
app.listen(port, () => console.log(`Example app listening on port ${port}!`));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', (req, res) => res.send('You found me!'));
app.get('/firstcall', (req, res) => res.send('You reached /firstcall.'));
app.get('/getData', (req, res) => {
  res.json(sheetCaller(sampleDataSend));
});

//global variables
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = 'token.json';
const sheetId = '1kkovYQY6Mg6IAna-O3QDOv3JGMlXlygha5Vaha3rKv0';



/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback, params = null) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    return params ? callback(oAuth2Client, params) : callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

//Get a sample of data from my sheet:
function sampleData(auth) {
  const sheets = google.sheets({version: 'v4', auth});
  sheets.spreadsheets.values.get({
    spreadsheetId: '1kkovYQY6Mg6IAna-O3QDOv3JGMlXlygha5Vaha3rKv0',
    range: 'A3:G',
  }, (err, res) => {
    if (err) {
      console.log(typeof err);
      console.log(Object.keys(err));
      console.log(err.response);
      return console.log('The API returned an error: ', err);
    }
    const rows = res.data.values;
    if (rows.length) {
      console.log('sampleData function:')
      console.log('Date, Player 1, Player 2, Winner:');
      rows.map((row) => {
        console.log(`${row[0]}, ${row[1]}, ${row[2]}, ${row[6]}`);
      });
    } else {
      console.log('No data found.')
    }
  });
}

function sampleDataSend(auth) {
  const sheets = google.sheets({version: 'v4', auth});
  const test = sheets.spreadsheets.values.get(v{
    spreadsheetId: sheetId,
    range: 'A3:G',
  }, (err, res) => {
    if (err) {
      console.log(typeof err);
      console.log(Object.keys(err));
      console.log(err.response);
      return console.log('The API returned an error: ', err);
    }
    const rows = res.data.values;
    if (rows.length) {
      const jsonRows = JSON.stringify(rows);
      console.log("Data:", jsonRows);
      return jsonRows;
    } else {
      console.log('No data found.');
      return "No data found.";
    }
  });
  console.log('TEST', test);
}

//Change the value of F5 to yes and G5 to Robin
function updateCells(auth) {
  const sheets = google.sheets({version: 'v4', auth});
  sheets.spreadsheets.values.update({
    spreadsheetId: '1kkovYQY6Mg6IAna-O3QDOv3JGMlXlygha5Vaha3rKv0',
    range: 'F5:G5',
    valueInputOption: 'RAW',
    resource: {
          "values": [
            ["yes", "Robin"]
          ]
    }
  }, (err, res) => {
    if (err) {
      console.log(typeof err);
      console.log(Object.keys(err));
      console.log(err.response);
      console.log('The API returned an error: ', err);
    }
  });
}

//A game is a array with the following variables: 
//date, player1 name, player2 name, score 1, score 2, finished?, winner.

function addGame(auth, game) {
  const sheets = google.sheets({version: 'v4', auth});
  sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: 'A:G',
    valueInputOption: 'RAW',
    resource: {
      "values": [
        game
      ]
    }
  });
}

// wrapper for api calls and authorization
async function sheetCaller(commandFunc, params = null) {
  console.log("Running sheetCaller");
  try {
    const creds = await fs.readFileSync('credentials.json');
    const response = params ? authorize(JSON.parse(creds), commandFunc, params) : authorize(JSON.parse(creds), commandFunc);
    console.log('RESPONSE IS: ', response);
    return response;
  } catch (err) {
    console.log('Error loading client secret file:', err);
  }
}
