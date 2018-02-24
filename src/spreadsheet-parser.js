const console = (function () {
	var timestamp = function () { };
	timestamp.toString = function () {
		return "[" + (new Date).toLocaleTimeString() + "]";
	};
	return {
		log: this.console.log.bind(this.console, '%s', timestamp)
	}
})();

var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const TOKEN_PATH = "./token.json";

var auth;
var sheets = google.sheets('v4');

function authorize(credentials) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

    fs.readFile(TOKEN_PATH, function (err, token) {
        if (err) {
            getNewToken(oauth2Client);
        }
        else {
            oauth2Client.credentials = JSON.parse(token);
            auth = oauth2Client;
            console.log('Spreadsheet credentials authenticated.');
        }
    })
}

function getNewToken(oauth2Client) {
    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    })

    console.log('Authorize this app by visiting this url: ', authUrl);
    var code = '';
    var rl = readline.createInterface(process.stdin, process.stdout);

    rl.question('Enter the code from that page here: ', function (code) {
        rl.close();
        oauth2Client.getToken(code, function (err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token;
            auth = oauth2Client;
            fs.writeFile(TOKEN_PATH, JSON.stringify(token));
            console.log('Token stored to ' + TOKEN_PATH);
        })
    });
}

function getSpreadsheetData(range, spreadsheetId, callback) {
    sheets.spreadsheets.values.get({
        auth: auth,
        spreadsheetId: spreadsheetId,
        range: range
    },
        function (err, response) {
            if (err) {
                console.log('The API returned an error: ', err);
                callback(err)
                return;
            }
            callback(response);
        })
}

function writeToSpreadsheet(range, spreadsheetId, data) {
    sheets.spreadsheets.values.append({
        range: range,
        spreadsheetId: spreadsheetId,
        data: data,
        insertDataOption: 'INSERT_ROWS'
    })
}

function init() {
    fs.readFile('./client_secret.json', function (err, content) {
        if (err) {
            console.log('Error loading client secret file ', err);
            return;
        }
        authorize(JSON.parse(content));
    })
}

module.exports = {
    init,
    writeToSpreadsheet,
    getSpreadsheetData
}