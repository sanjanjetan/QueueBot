// the token of your bot - https://discordapp.com/developers/applications/me
var bot = require("./bot.js");
var token = 'CHANGE_ME'; //for token in commerical use
var debug_token = 'CHANGE_ME'; //for token in testing environment

const MAIL_CLIENT = {
	username: 'CHANGE_ME', //email client details
	password: 'CHANGE_ME',
	host: 'CHANGE_ME' // Host server.  See server that your mail client uses.
};
const SPREADSHEET_CLIENT = {
	clientSecretFile: 'CHANGE_ME', // Client secret file used in the spreadsheet parser. See Google Developers API for more details
	spreadsheetId: 'SPREADSHEET_ID' // Spreadsheet Id
}

/*
 * Flag list, follow the format
 */
flags = [
	{
		flag: 'debug',
		description: 'uses debug token',
		execute: function () {
			token = debug_token;
		}
	}
]

function search_flag(flag) {
	for (var i = 0; i < flags.length; i++) {
		if (flags[i].flag == flag.toLowerCase()) {
			return flags[i];
		}
	}
	return false;
}

/*
 * process arguments
 */
var numArgs = 0;
process.argv.forEach(function (val, index, array) {
	if (val.startsWith('-')) {
		var flag = search_flag(val.substr(1));
		if (flag) {
			flag.execute();
		}
		else {
			console.log("unknown flag: " + val);
			process.exit(1);
		}
	}
	numArgs++;
	if (numArgs == process.argv.length) {
		bot.run(token, MAIL_CLIENT, SPREADSHEET_CLIENT);
	}
});
