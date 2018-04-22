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

const DEFAULTPREFIX = '/';
const ADMINPREFIX = '!';
const MAIL_PARSER_MODULE = require('./mail-parser.js');
var spreadsheetParser = require('./spreadsheet-parser.js');
var AsciiTable = require('ascii-table')
var _ = require('lodash');

var currentQueueChannel = "queue";
var mailParser;

/*
 * list of commands, descriptions and functions
 * keep manually sorted aplabetically
 */

var commands = {
	'add': {
		description: 'adds customer and q role to a mentioned user or users',
		parameters: ["user tag"],
		require: [],
		help: 'example use: `' + DEFAULTPREFIX + 'add @Queuebot#2414`',
		permittedRoles: ["ranks", "Bots"],
		execute: function (message, params) {
			var leeches = message.mentions.members;
			var rolesList = message.channel.guild.roles;
			if (leeches.size === 0) {
				message.channel.send(this.help);
				return;
			}
			leeches.forEach(function (leech) {
				var rolesToAdd = [];

				//if leech has a permitted role (is a rank), stop this action
				if (isPermitted(leech, commands['add'].permittedRoles))
				{
					message.channel.send("You are not permitted to give this user these roles.");
					return;
				}

				if (!hasRole(leech, "Q")) 
					rolesToAdd.push(rolesList.find("name", "Q").id); //if they don't have the roles already

				if (!hasRole(leech, "customers")) 
					rolesToAdd.push(rolesList.find("name", "customers").id);

				if (rolesToAdd.length === 0) {
					message.channel.send(leech + " already has the roles");
					return;
				}

				leech.addRoles(rolesToAdd, "added relevant customer roles").then(function (success) {
					message.channel.send("added roles to " + leech);
				}, function (error) {
					message.channel.send("Error adding customer role.  Error: " + error.message);
				});
			});
		}
	},
	'complete': {
		description: 'removes q role from a user',
		parameters: ["user tag or tags"],
		help: 'example use: `' + DEFAULTPREFIX + 'complete @Queuebot#1337`',
		permittedRoles: ["ranks"],
		execute: function (message, params) {
			var leeches = message.mentions.members;
			if (!(leeches.length > 0)) {
				message.channel.send(this.help);
				return;
			}
			leeches.forEach(function (leech) {
				//check they have role
				if (!hasRole(leech, "Q")) {
					message.channel.send(leech.displayName + " does not have Q role to remove");
					return;
				}
				leech.removeRole(message.channel.guild.roles.find("name", "Q").id, "remove leech").then(function (value) {
					message.channel.send("removed customer role");
				}, function (reason) {
					message.channel.send("error adding customer role, <@223758462796955648> help");
				});
			});
		},
	},
	'commands': {
		description: 'displays list of commands',
		parameters: [],
		permittedRoles: [],
		execute: function (message, params) {
			var response = "command list:";
			for (var command in commands) {
				if (commands.hasOwnProperty(command)) { //sanity check
					/* check permissions */
					var permitted = isPermitted(message.member, commands[command].permittedRoles);
					if (!permitted) continue;

					/* appends command to commandlist */
					response += '\n' + DEFAULTPREFIX + command;
					for (var i = 0; i < commands[command].parameters.length; i++) {
						response += ' <' + commands[command].parameters[i] + '>';
					}
				}
				response += ": " + commands[command].description;
			}
			message.channel.send(response);
		}
	},
	'creator': {
		description: 'displays the users who created and developed me!',
		parameters: [],
		permittedRoles: [],
		execute: function (message, params) {
			message.channel.send('Jia and Sanjan');
		}
	},
	'help': {
		description: 'displays this help message',
		parameters: [],
		permittedRoles: [],
		execute: function (message, params) {
			message.channel.send('\nIf you wish to request a leech, please fill out this form here: http://w11.zetaboards.com/LeechBA/pages/leechingrs3/ \n\n' +
				'Other Links:\nKing Guide for Leechers: http://w11.zetaboards.com/LeechBA/topic/10693049/1/ \n ');
		}
	},
	'resources': {
		description: 'Resources for ranks in leeches',
		parameters: [],
		permittedRoles: ["ranks"],
		execute: function (message, params) {
			message.channel.send('here are the resources for ranks.' +
				'\n General Guides (contains basic guides to all roles): http://w11.zetaboards.com/LeechBA/topic/10992439/1/' +
				'\n Attacker Tips: http://w11.zetaboards.com/LeechBA/topic/11379269/1/' +
				'\n Defender Guide: http://w11.zetaboards.com/LeechBA/topic/11659560/1/' +
				'\n Healer Guide for King: http://w11.zetaboards.com/LeechBA/topic/11530148/1/')
		}
	},
	'queue': {
		description: 'replies with queue url',
		parameters: [],
		permittedRoles: ["ranks"],
		execute: function (message, params) {
			message.channel.send('Queue available here: http://w11.zetaboards.com/LeechBA/topic/11562359/1/#new');
		}
	},
	'trial': {
		description: 'Trial information',
		parameters: [],
		help: 'Shows trial information and posts.',
		permittedRoles: [],
		execute: function (message, params) {
			message.channel.send('\nFor trial information, please read the information in this link: http://w11.zetaboards.com/LeechBA/topic/11206246/1 \n\n'
				+ 'The trial form is here: http://w11.zetaboards.com/LeechBA/pages/trialapp/')
		}
	},
	'timezone': {
		description: 'allows you to change your timezone role',
		parameters: ["USA AUS or EU"],
		help: 'timezones to choose from: USA, AUS, and EU. \n Example of usage: `' + DEFAULTPREFIX + 'timezone EU`',
		permittedRoles: [],
		execute: function (message, params) {
			if (typeof (params.args[1]) === 'undefined') {
				message.channel.send(this.help);
				return;
			}
			var user = message.member;
			var timezone = params.args[1].toUpperCase();
			switch (timezone) {
				case 'EU':
				case 'USA':
				case 'AUS':
					removeTimezone(user,
						function () {
							user.addRole(message.channel.guild.roles.find("name", timezone).id, "added " + timezone)
								.then(function () {
									message.channel.send("timezone successfully changed to " + timezone
									);
								}).catch(console.error);
						});
					break;
				default:
					message.channel.send(this.help);
					break;
			}
		}
	},
	'confirm': {
		description: "Confirms a leech to be added onto the queue",
		parameters: [],
		help: "Use this in the queue channel to add someone to the spreadsheet.",
		permittedRoles: ["ranks"],
		execute: function (message, params) {
			if (message.channel.name != currentQueueChannel) //TODO
			{
				console.log(message.author.username + " attempted to use the confirm command in the wrong channel.")
				return;
			}
			var args = message.content.split(' ');

			message.channel.fetchPinnedMessages().then(messages => {
				if (messages.size > 0) {
					if (!args[1]) {
						message.channel.send('Please enter the rsn of the person you are confirming or use the word "-all')
						return;
					}
					else if (args[1] === '-all') {
						messages.forEach(function (m) {
							if (m.author.bot) {
								m.unpin();
								message.channel.send('Confirmed.  Remember to confirm with the customer in FC/CC.')
								return;
							}
						})
					}
					else {
						var success = false;
						messages.forEach(function (m) {
							if (m.content.includes(args[1]) && m.author.bot && !success) // TODO: Filter by rsn
							{
								m.unpin();
								success = true;
							}
						})

						if (success) {
							message.channel.send('Confirmed. Remember to confirm with the customer in FC/CC.')
						}
						else {
							message.channel.send('No request exists.')
							message.delete();
						}
					}
				}
				else {
					message.channel.send('There are no entries to confirm.')
				}
			}).catch(console.error)
		}
	},
	'getuser': {
		description: 'Gets queue stats for a user',
		parameters: [],
		permittedRoles: ["ranks"],
		execute: function (message, params) {
			var args = message.content.split(' ');
			if(args.length > 0) {
				spreadsheetParser.getSpreadsheetData('Shortened Queue', function(response) {
					var userIndex = _.findIndex(response.data.values, function(o) { return _.find(o, function(p) { p.toUpperCase() === args[0].toUpperCase()} !== -1)});
					if (userIndex > -1) {
						var table = printValues(response.data.values[0], response.data.values[userIndex]);
						message.channel.send('```' + table.toString() + '```');
					}
					
				});
			}
			else {
				message.channel.send('No user specified.')
			}
		}
	}
}

var adminCommands = {
	'clearchat': {
		description: 'clears chat of last 50 messages',
		parameters: [],
		permittedRoles: ["stuff", "Server admin"],
		execute: function (message, params) {
			message.channel.fetchMessages().then(messages => message.channel.bulkDelete(messages)).catch(console.error);
		}
	},
	'commands': {
		description: 'Displays list of commands for admins',
		parameters: [],
		permittedRoles: ["stuff", "Server admin"],
		execute: function (message, params) {
			var response = "command list:";
			for (var command in adminCommands) {
				if (adminCommands.hasOwnProperty(command)) { //sanity check
					/* check permissions */
					var permitted = isPermitted(message.member, adminCommands[command].permittedRoles);
					if (!permitted) continue;
					/* appends command to commandlist */
					response += '\n' + ADMINPREFIX + command;
					for (var i = 0; i < adminCommands[command].parameters.length; i++) {
						response += ' <' + adminCommands[command].parameters[i] + '>';
					}
				}
				response += ": " + adminCommands[command].description;
			}
			message.channel.send(response);
		}
	},
	'docs': {
		description: 'Sends Discord.js document link',
		parameters: [],
		permittedRoles: ["Server admin"],
		execute: function (message, params) {
			message.channel.send('https://discord.js.org/#/docs/main/stable/general/welcome');
		}
	},
	'help': {
		description: 'Displays help for admins and moderators',
		parameters: [],
		permittedRoles: ["stuff", "Server admin"],
		execute: function (message, params) {
			//idk
		}
	},
	'pin': {
		description: 'Pins message in the channel after the command',
		parameters: [],
		permittedRoles: ["stuff", "Server admin"],
		execute: function (message, params) {
			params.args.splice(0, 1);
			var pinnedMessage = params.args.join(" ");
			message.channel.send(pinnedMessage).then(m => m.pin()).catch(function () {
				message.channel.send("error pinning message");
				console.error;
			});
		}
	},
	'ping': {
		description: 'checks the status of the requests module',
		parameters: [],
		permittedRoles: ["stuff", "Server admin"],
		execute: function (message, params) {
			mailParser.setAdminChannel(message.channel);
			mailParser.ping(message);
		}
	},
	'poll': {
		description: 'posts and pins a message, adding :thumbsup: :thumbsdown: :shrug: for people to vote',
		parameters: [],
		permittedRoles: ["stuff", "Server admin"],
		execute: function (message, params){
			message.channel.send(params.args.slice(1).join(' ')).then(async function(message){
				await message.react("👍");
				await message.react("👎");
				await message.react("🤷");
				await message.pin();
			});
		}
	},
	'queue': {
		description: 'allows modifications to where the default queue channel',
		parameters: ['-default', '-get', '-set'],
		help: '',
		permittedRoles: ["Server admin"],
		execute: function (message, params) {
			var args = message.content.split(' ');
			if (args[1] === params.parameters[0]) {
				currentQueueChannel = "queue";
				message.channel.send("Queue channel set to #" + currentQueueChannel);
				return;
			}
			else if (args[1] === params.parameters[1]) {
				message.channel.send("Queue channel currently set to #" + currentQueueChannel);
			}
			else if (args[1] === params.parameters[2]) {
				var channel = message.client.channels.find("name", args[2]);

				if (channel) {
					currentQueueChannel = channel.name;
					message.channel.send("Queue channel set to #" + currentQueueChannel)
					return;
				}
				else {
					message.channel.send("Error: channel #" + args[2] + " does not exist")
					return;
				}
			}
			else {
				message.channel.send("Command which channel to inspect for queue commands")
			}

		}
	},
	'reload': {
		description: 'reconnects requests module',
		parameters: [],
		permittedRoles: ["stuff", "Server admin"],
		execute: function (message, params) {
			mailParser.stop(); //mailparser autoreboots when disconnected
			message.channel.send("reloaded requests module");
		}
	},
	'readsheet': {
		description: 'Gets spreadsheet data',
		parameters: [],
		permittedRoles: ["stuff", "Server admin"],
		execute: function(message, params) {

			spreadsheetParser.getSpreadsheetData('Shortened Queue', function(response) {
				var table = printValues(response.data.values[0], response.data.values[1]);
				message.channel.send('```' + table.toString() + '```');
				
			});

		}
	},
	'writesheet': {
		description: 'Writes spreadsheet data',
		parameters: [],
		permittedRoles: ["stuff", "Server admin"],
		execute: function(message, params) {
			var data = ["", "21/2", "", "Sanjan", "HM10", "1", "1400", "1400", "1400", "1400", "", "", "", "", "", "Testing notes here"]
			spreadsheetParser.writeToSpreadsheet('Queue', data, function(response) {
			});
		}
	}
}

/* 
 * Prints values from the spreadsheet in readable format.
 *
 */
function printValues(header, rowValues) {
	var table = AsciiTable.factory({
		title: 'Queue User Request',
		heading: header,
		rows: rowValues
	});

	return table;
}

/*
 * removes all timezones from a user
 * @user: guild member object
 * @callback: a function that gets executed upon completion
 */
function removeTimezone(user, callback) {
	var timezones = ["EU", "USA", "AUS"];
	var roles = [];
	var i = 0;
	var removing = false;
	timezones.forEach(function (timezone) {
		if (user.roles.find('name', timezone)) {
			roles.push(user.guild.roles.find("name", timezone).id)
		}
	});
	if (roles.length > 0) {
		//async function complete then callback
		user.removeRoles(roles, "requested in changing timezones").then(function () {
			callback(); //TODO account for no callback param
		}).catch(console.error);
	}
	else {
		callback();
	}
}

/*
 * checks if a user has at least one of the set of roles
 */
function isPermitted(member, roles) {
	if (roles.length == -0)
		return true;

	for (var i = 0; i < roles.length; i++) {
		if (hasRole(member, roles[i]))
			return true;
	}
	return false;
}

/*
 * a user has a permission role
 * @member: guild member object
 * @role: role as a string (their name)
 * returns boolean
 */
function hasRole(member, role) {
	return member.roles.has(getRoleId(member, role));
}

/*
 * gets the id of a role
 * @member: guild member object
 * @role: role string name
 * returns id
 */
function getRoleId(member, role) {
	var role = member.guild.roles.find("name", role);
	if (role)
		return role.id;
	else
		return null;
}

/*
 *
 *
*/
function init(mailClient, spreadsheetClient, queueChannel, adminChannel) {
	mailParser = new MAIL_PARSER_MODULE.MailParser(mailClient, queueChannel, adminChannel);
	mailParser.init();
	spreadsheetParser.init(spreadsheetClient);
}

module.exports = {
	DEFAULTPREFIX,
	ADMINPREFIX,
	commands,
	adminCommands,
	isPermitted,
	getRoleId,
	hasRole, //maybe don't need this
	init
}
