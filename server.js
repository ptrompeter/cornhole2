//import environment variables
const envs = require('dotenv').config();

//express configuration
const express = require('express');
const app = express();
const port = process.env.SERVER_PORT;

//dependencies
const fs = require('fs');
const readline = require('readline');
// const { google } = require('googleapis');
const bluebird = require('bluebird');
const { google } = bluebird.promisifyAll(require('googleapis'), { suffix: 'BBAsync' });
const { R } = require('ramda');


// server routes
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

//testing variables
const sampleGetCommand = {
  spreadsheetId: sheetId,
  range: 'A3:G',
}

const sampleUpdateCommand = {
  spreadsheetId: sheetId,
  range: 'A:G',
  valueInputOption: 'RAW',
  resource: {
    "values": [
      ['2019-02-14', 'Dennis', 'Boris', 13, 21, 'yes', 'Boris']
    ]
  }
}

async function getAuthorizationToken() {
  const credentials = fs.readFileSync('credentials.json');
  const { client_secret, client_id, redirect_uris } = JSON.parse(credentials).installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  try {
    const token = fs.readFileSync(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(token));
    return oAuth2Client;
  } catch (err) {
    const newToken = await getNewToken(oAuth2Client);
    return newToken;
  }
}

async function getNewToken(oAuth2Client) {
  const authParams = {
    access_type: 'offline',
    scope: SCOPES,
  };
  const authUrl = oAuth2Client.generateAuthUrl(authParams);
  
  //Prompt to direct user to authorize this app
  console.log('Authorize this app by visiting this url:', authUrl);

  const readlineParams = {
    input: process.stdin,
    output: process.stdout,
  };
  const rl = readline.createInterface(readlineParams);

  rl.question('Enter ode: ', async (code) => {
    rl.close();
    try {
      const getToken = bluebird.promisify(oAuth2Client.getToken, { context: oAuth2Client });
      const token = await getToken(code);
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
      oAuth2Client.setCredentials(token);
      return oAuth2Client;
    } catch(err) {
      console.log(err);
    }
  });
}



//  This function promisifies and then accesses the get method of a google sheets object.
//  It takes an object with method parameters.  At a minimum it must include spreadsheetId and range values.  
//  Range must be in the special An:Xn format.
async function getData(auth, commandObj) {
  const sheets = google.sheets({ version: 'v4', auth });
  const getDataPromise = await bluebird.promisify(sheets.spreadsheets.values.get, { context: sheets.values });
  const res = await getDataPromise(commandObj);
  const rows = res.data.values;
  if (!rows.length) {
    console.log('No data found.');
  }
  return rows;
}

async function run() {
  const auth = await getAuthorizationToken();
  console.log(getData(auth, sampleGetCommand));
}

run();

function addData(auth, commandObj) {
  const sheets = google.sheets({version: 'v4', auth});
  const addDataPromise = await bluebird.promisify(sheets.spreadsheets.values.append, { context: sheets.values });
  const res = await addDataPromise(commandObj);
  return res;
}

// //Change the value of F5 to yes and G5 to Robin

// function updateCells(auth) {
//   const sheets = google.sheets({version: 'v4', auth});
//   sheets.spreadsheets.values.update({
//     spreadsheetId: '1kkovYQY6Mg6IAna-O3QDOv3JGMlXlygha5Vaha3rKv0',
//     range: 'F5:G5',
//     valueInputOption: 'RAW',
//     resource: {
//           "values": [
//             ["yes", "Robin"]
//           ]
//     }
//   }, (err, res) => {
//     if (err) {
//       console.log(typeof err);
//       console.log(Object.keys(err));
//       console.log(err.response);
//       console.log('The API returned an error: ', err);
//     }
//   });
// }

// //A game is a array with the following variables: 
// //date, player1 name, player2 name, score 1, score 2, finished?, winner.

// function addGame(auth, game) {
//   const sheets = google.sheets({version: 'v4', auth});
//   sheets.spreadsheets.values.append({
//     spreadsheetId: sheetId,
//     range: 'A:G',
//     valueInputOption: 'RAW',
//     resource: {
//       "values": [
//         game
//       ]
//     }
//   });
// }

// // wrapper for api calls and authorization
// async function sheetCaller(commandFunc, params = null) {
//   console.log("Running sheetCaller");
//   try {
//     const creds = await fs.readFileSync('credentials.json');
//     const response = params ? authorize(JSON.parse(creds), commandFunc, params) : authorize(JSON.parse(creds), commandFunc);
//     console.log('RESPONSE IS: ', response);
//     return response;
//   } catch (err) {
//     console.log('Error loading client secret file:', err);
//   }
// }
