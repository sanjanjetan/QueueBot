// debugging
const console = (function(){
	var timestamp = function(){};
	timestamp.toString = function(){
		return "[" + (new Date).toLocaleTimeString() + "]";
	};
	return {
		log: this.console.log.bind(this.console, '%s', timestamp)
	}
})();

const DEFAULTPREFIX = '/'
const ADMINPREFIX = '!'

/*
 * list of commands, descriptions and functions
 * keep manually sorted aplabetically
 */

var commands = {
    'add': {
        description: 'adds customer and q role ',
        parameters: ["user tag"],
        permittedRoles: ["ranks","Bots"],
        execute: function(message,params){
			var leeches = message.mentions.members;
			var rolesList = message.channel.guild.roles;
			leeches.forEach(function(leech){
				var rolesToAdd = [];
			 	//if leech has a permitted role, stop this action
			 	if(isPermitted(leech,commands[params[0]].permittedRoles)){
					message.reply("you are not permitted to give them these roles");
					return;
				}
				if(!hasRole(leech,"Q")) rolesToAdd.push(rolesList.find("name","Q").id); //if they don't have the roles already
				if(!hasRole(leech,"customers")) rolesToAdd.push(rolesList.find("name","customers").id);

				if(rolesToAdd.length===0){
					message.reply(leech+" already has the roles");
					return;
				}

				leech.addRoles(rolesToAdd,"added relevant customer roles").then(function(success){
					message.reply("added roles to "+leech);
				},function(error){
					message.reply("error adding customer role");
				});
			});
        }
    },
	'complete':{
		description: 'removes q role from a user',
		parameters: [],
		permittedRoles: [],
		execute: function(message,params){
			//TODO
		},
	},
    'commands':{
        description: 'displays list of commands',
        parameters: [],
        permittedRoles: [],
        execute: function(message,params){
            var response = "command list:";
            for(var command in commands){
                if(commands.hasOwnProperty(command)){ //sanity check
                    /* check permissions */
                    var permitted=isPermitted(message.member,commands[command].permittedRoles);
                    if(!permitted) continue;

										/* appends command to commandlist */
                    response += '\n'+DEFAULTPREFIX+command;
                    for(var i=0;i<commands[command].parameters.length;i++){
                        response += ' <'+commands[command].parameters[i]+'>';
                    }
                }
                response += ": " + commands[command].description;
            }
            message.reply(response);
        }
    },
    'creator':{
        description: 'displays the users who created and developed me!',
        parameters: [],
        permittedRoles: [],
        execute: function(message,params){
            message.reply('Jia and Sanjan');
        }
    },
    'help': {
        description: 'displays this help message',
        parameters: [],
        permittedRoles: [],
        execute: function(message,params){
            message.reply('hello');
            //TODO
			console.log("hello");
        }
    },
    'queue':{
        description: 'replies with queue url',
        parameters: [],
        permittedRoles: ["ranks"],
        execute: function(message,params){
            message.reply('Queue available here: http://w11.zetaboards.com/LeechBA/topic/11562359/1/#new');
        }
    },
    'timezone': {
        description: 'allows you to change your timezone role',
        parameters: ["USA AUS or EU"],
        help: 'timezones to choose from: USA, AUS, and EU. \n Example of usage: `'+DEFAULTPREFIX+'timezone EU`',
        permittedRoles: [],
        execute: function(message,params){
            if(typeof(params[1]) === 'undefined'){
                message.reply(this.help);
                return;
            }
            var user = message.member;
            var timezone = params[1].toUpperCase();
            switch(timezone){
                case 'EU':
                case 'USA':
                case 'AUS':
                    removeTimezone(user, function(){user.addRole(message.channel.guild.roles.find("name",timezone).id,"added "+timezone).then(function(){
                        message.reply("timezone successfully changed to "+timezone);
                    }).catch(console.error);});
                    break;
                default:
                    message.reply(this.help);
                    break;
            }
        }
    },
    'confirm': {
        description: "Confirms a leech to be added onto the queue",
        parameters: [],
        help: "Use this in the queue channel to add someone to the spreadsheet.",
        permittedRoles: [],
        execute: function(message, params){

        }
    },
    'spreadsheet': {
        description: 'Test function to get spreadsheet',
        parameters: [],
        help: 'This is a simple test function to get the spreadsheet.',
        permittedRoles: [],
        execute: function(message, params) {

        }
    }
}
var adminCommands = {

}
/*
 * removes all timezones from a user
 * @user: guild member object
 * @callback: a function that gets executed upon completion
 */
function removeTimezone(user,callback){
	var timezones = ["EU","USA","AUS"];
	var roles = [];
	var i=0;
	var removing=false;
	timezones.forEach(function(timezone){
		if(user.roles.find('name',timezone)){
			roles.push(user.guild.roles.find("name",timezone).id)
		}
	});
	if(roles.length>0){
		//async function complete then callback
		user.removeRoles(roles,"requested in changing timezones").then(function(){
			callback(); //TODO account for no callback param
		}).catch(console.error);
	}else{
		callback();
	}
}

/*
 * checks if a user has at least one of the set of roles
 */
function isPermitted(member,roles){
	if(roles.length==-0) return true;
	for(var i=0;i<roles.length;i++){
		if(hasRole(member,roles[i])) return true;
	}
	return false;
}

/*
 * a user has a permission role
 * @member: guild member object
 * @role: role as a string (their name)
 * returns boolean
 */
function hasRole(member,role){
	return member.roles.has(getRoleId(member,role));
}

/*
 * gets the id of a role
 * @member: guild member object
 * @role: role string name
 * returns id
 */
function getRoleId(member,role){
	return member.guild.roles.find("name",role).id;
}

module.exports = {
    DEFAULTPREFIX,
    ADMINPREFIX,
    commands,
	adminCommands,
	isPermitted,
	getRoleId,
	hasRole //maybe don't need this
}
