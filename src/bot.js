// debugging
const console = (function () {
	var timestamp = function () { };
	timestamp.toString = function () {
		return "[" + (new Date).toLocaleTimeString() + "]";
	};
	return {
		log: this.console.log.bind(this.console, '%s', timestamp)
	}
})();

const Discord = require('discord.js');

const bot = new Discord.Client();
var lastcheck = new Date();

var last = 0;
const commandList = require('./command-list.js');

/*
 * Parses through a message with the default command prefix
 * @message: message object
 * @params: list of strings split up by spaces
 */
function handleCommand(message, params) {
	params[0] = params[0].substr(1);//drop prefix
	if (params[0] in commandList.commands) {
		var command = commandList.commands[params[0]];
		//if the user has the permissions to execute the command
		if (commandList.isPermitted(message.member, command.permittedRoles)) {
			var commandParams = {
				args: params,
				parameters: command.parameters
			};
			command.execute(message, commandParams);
		}
	}
}

/*
 * see handleCommand
 */
function handleAdminCommand(message, params) {
	params[0] = params[0].substr(1);//drop prefix
	if (params[0] in commandList.adminCommands) {
		var command = commandList.adminCommands[params[0]];
		if (commandList.isPermitted(message.member, command.permittedRoles)) {
			var commandParams = {
				args: params,
				parameters: command.parameters
			};
			command.execute(message, commandParams);
		}
	}
}

exports.run = function (token, mailClient, spreadsheetClient) {
	bot.on('ready', () => {
		console.log('bot ready');
		let adminChannel = bot.channels.find("name", "bot-test");
		let queueChannel = bot.channels.find("name", "bot-test");

		commandList.init(mailClient, spreadsheetClient, queueChannel, adminChannel);
	});

	bot.on('disconnect', function (erMsg, code) {
		console.log('----- Bot disconnected from Discord with code', code, 'for reason:', erMsg, '-----');
	});

	bot.on('error', function (message) {
		console.log(new Date().toString() + 'error recieved', message);
	});

	bot.on('message', message => {
		var args = message.content.split(" ");
		/* commands */
		if (args[0].startsWith(commandList.DEFAULTPREFIX)) {
			handleCommand(message, args);
		}
		/* admin/mod commands */
		if (args[0].startsWith(commandList.ADMINPREFIX)) {
			handleAdminCommand(message, args);
		}

		/* AI responses */
		//TODO

		/* moderation commands */
		//TODO
	});

	// log our bot in
	bot.login(token);
}
