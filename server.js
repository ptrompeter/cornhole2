require('dotenv').config();

const express = require('express')
const app = express()
const port = process.env.SERVER_PORT

app.get('/', (req, res) => res.send('You found me!'));
app.get('/firstcall', (req, res) => res.send('You reached /firstcall.'));
app.get('/getdata', (req, res) => res.send([sheetCaller(sampleDataSend)]));

app.listen(port, () => console.log(`Example app listening on port ${port}!`))


const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
// fs.readFile('credentials.json', (err, content) => {
//   if (err) return console.log('Error loading client secret file:', err);
//   // Authorize a client with credentials, then call the Google Sheets API.
//   authorize(JSON.parse(content), listMajors);
// });

//my executables?
// fs.readFile('credentials.json', (err, content) => {
//   if (err) return console.log('Error loading client secret file:', err);
//   // Authorize a client with credentials, then call the Google Sheets API.
//   authorize(JSON.parse(content), updateCells);
// });
const sheetId = '1kkovYQY6Mg6IAna-O3QDOv3JGMlXlygha5Vaha3rKv0';



/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback, params = null) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    params ? callback(oAuth2Client, params) : callback(oAuth2Client);
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

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function listMajors(auth) {
  const sheets = google.sheets({version: 'v4', auth});
  sheets.spreadsheets.values.get({
    spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
    range: 'Class Data!A2:E',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const rows = res.data.values;
    if (rows.length) {
      console.log('Name, Major:');
      // Print columns A and E, which correspond to indices 0 and 4.
      rows.map((row) => {
        console.log(`${row[0]}, ${row[4]}`);
      });
    } else {
      console.log('No data found.');
    }
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
      return console.log('The API returned an error: ' + err);
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
  sheets.spreadsheets.values.get({
    spreadsheetId: '1kkovYQY6Mg6IAna-O3QDOv3JGMlXlygha5Vaha3rKv0',
    range: 'A3:G',
  }, (err, res) => {
    if (err) {
      console.log(typeof err);
      console.log(Object.keys(err));
      console.log(err.response);
      return console.log('The API returned an error: ' + err);
    }
    const rows = res.data.values;
    if (rows.length) {
      return rows;
    } else {
      console.log('No data found.');
      return "No data found.";
    }
  });
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
      return console.log('The API returned an error: ' + err);
    }
  });
}

const newGame = (date, p1, p2, s1, s2, finished, winner) => [date, p1, p2, s1, s2, finished, winner];


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
function sheetCaller(commandFunc, params = null) {
  console.log("Running sheetCaller")
  const output = fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Sheets API.
    params ? authorize(JSON.parse(content), commandFunc, params) : authorize(JSON.parse(content), commandFunc);
  });
  console.log(output);
  console.log("end of sheetCaller")
  return output
}

// const exampleGame = newGame('2019-02-14', 'Jodi', 'Grant', 21, 12, 'yes', 'Jodi');
// sheetCaller(addGame, exampleGame);


// sheetCaller(sampleDataSend);
