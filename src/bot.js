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

const Discord = require('discord.js');

const bot = new Discord.Client();
var lastcheck = new Date();
var mailClient;

var mailParser;
var last=0;
const commandList = require('./command-list.js');
const mailParserModule = require('./mail-parser.js');


/*
 * Parses through a message with the default command prefix
 * @message: message object
 * @params: list of strings split up by spaces
 */
function handleCommand(message,params){
	params[0]=params[0].substr(1);//drop prefix
	if(params[0] in commandList.commands){
		var command = commandList.commands[params[0]];
		//if the user has the permissions to execute the command
		if(commandList.isPermitted(message.member,command.permittedRoles)){
			var commandParams = {args: params};
			command.execute(message,commandParams);
		}
	}
}

/*
 * see handleCommand
 */
function handleAdminCommand(message,params){
	params[0]=params[0].substr(1);//drop prefix
	if(params[0] in commandList.adminCommands){
		var command = commandList.adminCommands[params[0]];
		if(commandList.isPermitted(message.member,command.permittedRoles)){
			var commandParams = {args: params, mailParser: mailParser};
			command.execute(message,commandParams,mailParser);
		}
	}
}

/*
bot.on('message', message => {
	   var admin=message.member.hasPermission('ADMINISTRATOR');
	   var mod=message.member.roles.has(message.channel.guild.roles.find("name","stuff").id);
	   var rank=message.member.roles.has(message.channel.guild.roles.find("name","ranks").id)
	   if(admin) mod=true;
	   if(mod) rank=true;
	   if(message.channel.name === 'customer-chat' && !rank){
		   //customer AI response
		   if(message.content.toLowerCase().includes("thank") && message.content.toLowerCase().includes("done") ||
              message.content.toLowerCase().includes("thanks for the service")|| message.content.toLowerCase().includes("ty for the service") || message.content.toLowerCase().includes("thx for the service")||
			  message.content.toLowerCase().includes("thanks guys")||message.content.toLowerCase().includes("ty guys")||message.content.toLowerCase().includes("thx guys")){
                message.reply("thanks for leeching, don't forget to leave a comment on our RSOF: http://services.runescape.com/m=forum/forums.ws?194,195,569,64782885 :)");
		   }
		   if(message.content.toLowerCase().includes("how") && message.content.toLowerCase().includes("much") || message.content.toLowerCase().includes("hm")){
			   if(message.content.toLowerCase().includes("bxp")|| message.content.toLowerCase().includes("points")||message.content.toLowerCase().includes(" hat")||message.content.toLowerCase().includes("rate")){
				   message.reply("the calculator will be able to help you out; located here: http://w11.zetaboards.com/LeechBA/pages/leechingrs3/");
			   }
		   }
	   }
	   //shadowmemes
	   if(message.member.id==='223758462796955648'){
		   if(message.content.toLowerCase().includes("srsly") && message.content.length<=11){
			   message.reply("yes seriously :)");
		   }
		   if(message.content.toLowerCase()==="tbh"){
			   message.reply("tbh");
		   }
		   if(message.content.toLowerCase()==="sth"){
			   message.reply("sth sth blah blah");
		   }
	   }

	   if (message.content.startsWith('/confirm') ||message.content.startsWith('!confirm')||message.content.startsWith('confirm')){
		   //make sure in right channel
		   if(message.channel.name!=queuechannel){
			   return;
		   }
		   var args = message.content.split(" ");
		   //make sure there are pinned messages
		   message.channel.fetchPinnedMessages().then(messages => {
				  if(messages.size>0){
					  if(typeof args[1] === 'undefined'){
						  message.channel.send('Please enter the rsn of the person you are confirming or use the word "-all". E.g. "confirm -all".');
						  return;
					  }
					  if(args[1]==='-all'){
						  messages.forEach(function(m){
							    if(m.author.bot) m.unpin();
							});
							message.channel.send('Confirmed. Remember to confirm with the customers in FC/CC.');
							return;
					  }else{
						  var success = false;
						  messages.forEach(function(m){
							   if(m.content.includes(args[1])){//REDO
								   if(m.author.bot&&!success){
									   m.unpin();
									   success=true;
								   }
							   }
						   });
						  if(success==true){
							  message.channel.send('Confirmed. Remember to confirm with the customer in FC/CC.');
						  }else{
							  message.channel.send('No request exists.');
							  message.delete(); //stop cunts from exploiting it to spam
						  }
						  return;
					  }
				  }else{
					  message.channel.send('There are no entries to confirm.');
				  }
				  return;
		   }).catch(console.error);
		   return;
	   }
	   if(message.channel.name=='queue' && !mod && !message.author.bot){
			//if it's in the queue channel
			message.delete();
			//check when the last bot warning was
			var current = new Date();
			if(last==0 || (Math.floor(Math.abs(current - last) / 36e5))>0){
				last = new Date();
				message.channel.send("To avoid spam. Permitted queue commands: /help /confirm /queue");
			}
			return;
	   }

	   if (message.content.startsWith('!admin')){
		   if(args[1]==='queue'){
			   if(args[2]==='-default'){
				   queuechannel="queue";
				   message.channel.send("Queue channel set to #"+queuechannel);
				   return;
			   }
			   if(args[2]==='-get'){
				   message.channel.send("Queue channel is currently set to #" +queuechannel);
				   return;
			   }
			   if(args[2]==='-set'){
				   if(typeof args[3]==='undefined'){
					   queuechannel=message.channel.name;
				   }else{
					   if (bot.channels.find("name",args[3]) === null) {
						   message.channel.send("Error: channel #" + args[3] + " does not exist.");
						   return;
					   }
					   queuechannel=args[3];
				   }
				   message.channel.send("Queue channel set to #" +queuechannel);
				   return;
			   }
			   message.channel.send("For commanding which channel the queue bot to inspect.\nUsage '!admin queue -<param>'\nParams available: get, set channel, default.\nE.g. !admin queue -get");
		   }
		   return;
	   }

});
*/

exports.run = function(token,mailClient) {
	bot.on('ready', () => {
		console.log('bot ready');
		let adminChannel = bot.channels.find("name", "bot-test");
		let queueChannel = bot.channels.find("name", "bot-test");
		mailParser = new mailParserModule.MailParser(mailClient,queueChannel,adminChannel);
		mailParser.init();
		/* debugging to see if it autoreconnects
		var x = setInterval(function(){
			mailParser.stop();
		},5000);//3600000*/
	});

	bot.on('disconnect', function(erMsg, code){
		console.log('----- Bot disconnected from Discord with code', code, 'for reason:', erMsg, '-----');
	});

	bot.on('error', function(message){
		console.log(new Date().toString()+'error recieved', message);
	});

	bot.on('message', message =>{
		var args = message.content.split(" ");
		/* commands */
		if(args[0].startsWith(commandList.DEFAULTPREFIX)){
			handleCommand(message,args);
		}
		/* admin/mod commands */
		if(args[0].startsWith(commandList.ADMINPREFIX)){
			handleAdminCommand(message,args);
		}

		/* AI responses */
		//TODO

		/* moderation commands */
		//TODO
	});

	// log our bot in
	bot.login(token);
}
