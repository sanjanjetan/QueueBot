const DEFAULTPREFIX = '/'
const ADMINPREFIX = '!'

var commands = {
    'add': {
        description: 'adds customer and q role ',
        parameters: ["user tag"],
        permittedRoles: ["ranks"],
        execute: function(message,params){
            //message.reply('hello');
            //TODO
        }
    },
    'commands':{
        description: 'displays list of commands',
        parameters: [],
        permittedRoles: [],
        execute: function(message,params){
            var response = "command list:";
            for(var command in commands){
                if(commands.hasOwnProperty(command)){
                    /* check permissions */
                    if(commands[command].permittedRoles.length>0){
                        var permitted=false;
                        for(var i=0;i<commands[command].permittedRoles.length;i++){
                            if(isPermitted(message.member,commands[command].permittedRoles[i])){
                                permitted=true;
                                break;
                            }
                        }
                        if(!permitted) continue;
                    }

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

module.exports = {
    DEFAULTPREFIX,
    ADMINPREFIX,
    commands
}

