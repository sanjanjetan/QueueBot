//created by jia
//version 1.0
//all rights reserved
//buggy code why do you even want this

const Discord = require('discord.js');
var MailListener = require("mail-listener2");

const bot = new Discord.Client();
var queuechannel = "queue";
var adminchannel = "trials";
var lastcheck = new Date();
var mailClient;
var commandList = require('./command-list');

// from Discord _after_ ready is emitted.
var mailListener;
function nFormatter(num, digits) {
	var si = [
			  { value: 1E18, symbol: "E" },
			  { value: 1E15, symbol: "P" },
			  { value: 1E12, symbol: "T" },
			  { value: 1E9,  symbol: "G" },
			  { value: 1E6,  symbol: "M" },
			  { value: 1E3,  symbol: "k" }
			  ], rx = /\.0+$|(\.[0-9]*[1-9])0+$/, i;
	for (i = 0; i < si.length; i++) {
		if (num >= si[i].value) {
			return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
		}
	}
	return num.toFixed(digits).replace(rx, "$1");
}
// create an event listener for messages
var DEBUG = (function(){
	var timestamp = function(){};
	timestamp.toString = function(){
		return "[" + (new Date).toLocaleTimeString() + "]";
	};
	return {
		log: console.log.bind(console, '%s', timestamp)
	}
})();

var last=0;
/*
 * list of commands, descriptions and functions
 * keep manually sorted aplabetically
 */

/*
 * Parses through a message with the default command prefix
 * @message: message object
 * @params: list of strings split up by spaces
 */
function handleCommand(message,params){
	var command;
	//drop prefix
	if(params[0].substr(1) in commandList.commands){
		command = commandList.commands[params[0].substr(1)];
		command.execute(message,params);
	}
}

/*
 *
 */
function handleAdminCommand(message,params){
	var command;
}

/*
 * a user has a permission role
 * @user: user object
 * @role: role as a string
 * returns boolean
 */
function isPermitted(user,role){
	return user.roles.has(user.guild.roles.find("name",role).id);
}

bot.on('message', message =>{
	var args = message.content.split(" ");
	/* commands */
	if(args[0].startsWith(commandList.DEFAULTPREFIX)){
		handleCommand(message,args);
	}
	/* admin/mod commands */
	//TODO

	/* AI responses */
	//TODO

	/* moderation commands */
	//TODO

});
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

	   if(message.content.startsWith('/add')){
		   if(!rank){
			   return;
		   }
		   var args = message.content.split(" ");
		   //console.log(args[1]);
		   var leeches = message.mentions.members;
		   leeches.forEach(function(leech){
			   //console.log(leech.id);
			   if(leech.roles.has(message.channel.guild.roles.find("name","ranks").id)){
				   message.reply("why are you making a rank also a customer...");
				   return;
			   }
			   leech.addRole(message.channel.guild.roles.find("name","Q").id,"added queue").then(function(value){
					 leech.addRole(message.channel.guild.roles.find("name","customers").id,"added customers").then();
					 message.reply("added customer role to "+leech);
				 }, function(reason){
					message.reply("error adding customer role, <@223758462796955648> help");
				 });

		   });
		   return;
	   }
	   if(message.content.startsWith('/complete')){
		   if(!rank){
			   return;
		   }
		   var args = message.content.split(" ");
		   var leeches = message.mentions.members;
		   leeches.forEach(function(leech){
			   //console.log(leech.id);
		   leech.removeRole(message.channel.guild.roles.find("name","Q").id,"remove leech").then(function(value){
			 message.reply("removed customer role");
			 }, function(reason){
			 message.reply("error adding customer role, <@223758462796955648> help");
			 });
		   });
		   return;
	   }
	   if(message.content.startsWith('/call')){
		   bot.channels.find("name", "ranked-chat").send("oi <@223758462796955648>, "+ message.member +" needs you over in "+ message.channel);
		   return;
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

	   //mod commands
	   if (!mod & !admin) return;
	   if (message.content === '!help'){
		   message.channel.send('Mod commands: !mod');
	   }
	   if (message.content.startsWith('!mod')){
		   var args = message.content.split(" ");
		   if(typeof args[1]==='undefined'){
			   message.channel.send("Usage\n'!mod <command>' - commands available: ping, refresh.\n- ping checks the status of the queue bot.\n- refresh reboots in case of issues.");
		   }
		   if(args[1]==='ping'){
					message.channel.send("Sending test request...");
					adminchannel=message.channel;
					ping(message);
		   }
		   if(args[1]==='refresh') {
			   mailListener.stop();
			   mailListener=null;
			   return;
		   }
		   return;
	   }


		//admin commands
	   if (!admin) return;
	   if (message.content === '!help'){
		   message.channel.send('Admin commands: !admin !clearchat !developer');
		   return;
	   }
	   if (message.content === '!clearchat') {
		   //console.log(message.channel.messages);
		   message.channel.fetchMessages().then(messages => message.channel.bulkDelete(messages)).catch(console.error);
		   return;
	   }
	   if (message.content === '!developer') {
		   message.channel.send('Since Jia is bad: https://discord.js.org/#/docs/main/stable/general/welcome');
		   return;
	   }
	   if (message.content.startsWith('!admin')){
		   var args = message.content.split(" ");
		   if(typeof args[1]==='undefined'){
			   message.channel.send("Usage\n'!admin <command>' - commands available: pin, queue.");
		   }
		   if(args[1]==='pin'){
			   args.splice(0,2);
			   pmessage = args.join(" ");
			   message.channel.send(pmessage).then(m => m.pin()).catch(console.error);
		   }
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
		   if(args[1]==='test'){
	   //message.member.removeRole(message.member.guild.roles.find("name","EU").id,"requested in changing timezones").catch(console.error);
			   remove_timezone(message.member,function(){console.log("done!")});
			   if(typeof args[2]==='undefined') return;
			   if (args[2]==='disconnect'){
				   mailListener.stop();
				   message.channel.send("disconnecting listener");
				   return;
			   }
			   if (bot.channels.find("name",args[2]) !== null) {
				   message.channel.send("i exist");
			   }
		   }
		   return;
	   }
	   if (message.content.startsWith('!tts')){
		   message.delete();
		   message.channel.send('/tts test');
	   }

});
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
				callback();
			}).catch(console.error);
		}else{
			callback();
		}
}
function init(){
	var m = new MailListener({
		 username: mailClient.username,
		 password: mailClient.password,
		 host: "xo4.x10hosting.com",
		 port: 993, // imap port
		 tls: true,
		 connTimeout: 10000, // Default by node-imap
		 authTimeout: 5000, // Default by node-imap,
		 //debug: console.log, // Or your custom function with only one incoming argument. Default: null
		 tlsOptions: { rejectUnauthorized: false },
		 mailbox: "INBOX", // mailbox to monitor
		 searchFilter: ["UNSEEN"], // the search filter being used after an IDLE notification has been retrieved
		 markSeen: true, // all fetched email willbe marked as seen and not fetched next time
		 fetchUnreadOnStart: true, // use it only if you want to get all unread email on lib start. Default is `false`,
		 mailParserOptions: {streamAttachments: true}, // options to be passed to mailParser lib.
		 attachments: false, // download attachments as they are encountered to the project directory
	 });
	m.on("server:connected", function(){
					console.log("imapConnected");
					});

	m.on("server:disconnected", function(){
		console.log("imapDisconnected");
		//https://github.com/chirag04/mail-listener2/issues/8 //for future
		console.log("=====reconnecting");
		m = null;
		m = init();
		m.start();
	});

	m.on("error", function(err){
		console.log(err);
		m.stop();
	});

	m.on("mail", function(mail, seqno, attributes){

		var channel = bot.channels.find("name", queuechannel);
		var d = new Date();
		var month = ('0' + (d.getMonth() + 1)).slice(-2);
		var date = ('0' + d.getDate()).slice(-2);
		var message="";
		 if(mail.subject=="admin-test"){
			 adminchannel.send("Request acknowledged and received.\nMessage: "+mail.text);
			 return;
		 }
		if(mail.subject=="xp"){
			var data = JSON.parse(mail.text);
			//filter ba
			var ba = "(NM1)";
			switch(data.ba){
				case "none":
					ba="(NM1)";
					break;
				case "queen":
					ba="(HM1)";
					break;
				case "hardmode":
					ba="(HM6)";
					break;
				default:
					ba="(HM10)";
					break;
			}
			var amount = parseInt(data.amount.split(',').join(''));
			if(amount>0 && data.rsn){
				amount = nFormatter(amount,2);
		 		var rsn_bxp = data.rsn;
		 		if(ba=="(NM1)") rsn_bxp="[color=orange]"+data.rsn+"[/color]";
				var s0="RSN: "+data.rsn+"\nLeech: BXP\nSkill: "+data.skill+"\nLevel: "+data.level+"\nAmount: "+data.amount+"\nBA completed up to: "+ba+"\n\n\n";
				var s1="Copy and paste: \n[*] "+date+"/"+month+": "+data.rsn+" - "+amount+ " "+data.skill+" bxp "+ba;
				message="```".concat(s0.concat(s1.concat("```")));
				channel.send(message).then(m => m.pin()).catch(console.error);;
			}
			return;
		}
		 if(mail.subject=="item"){
			 var data = JSON.parse(mail.text);
			 var ba = "(NM1)";
			 var current = "";
			 var need = "";
			 var net ="";
			 var n = "";
			 var enhancer = "";
			 var ironman ="";
			 var needA=0;
			 var needD=0;
			 var needH=0;
			 var needC=0;

			 switch(data.ba){
				  case "none":
				 	  ba=" (NM1)";
					  break;
				  case "queen":
					  ba=" (HM1)";
					  break;
				  case "hardmode":
					  ba=" (HM6)";
					  break;
				  default:
					  ba=" (HM10)";
					  break;
			 }
			 var leech = data.preset;
			 var king = "";
			 var leech_simple = data.preset;
			 var insignia = false;

			 if(leech == "levels"){
				 leech = "points";
				 leech_simple = leech;
			 }
			 //calculate relevant information of want and needs
			 var attlvl = data.alevel;
			 var collvl = data.clevel;
			 var heallvl = data.hlevel;
			 var deflvl = data.dlevel;

			 var att = data.apoints;
			 var col = data.cpoints;
			 var heal = data.hpoints;
			 var def = data.dpoints;

			 var want_attlvl = data.want_alevel;
			 var want_collvl = data.want_clevel;
			 var want_heallvl = data.want_hlevel;
			 var want_deflvl = data.want_dlevel;

			 var want_att = data.want_apoints;
			 var want_col = data.want_cpoints;
			 var want_heal = data.want_hpoints;
			 var want_def = data.want_dpoints;


			 //if appropriate
			 //convert all into points
			 const leveldifference = [0,200,300,400,500,0];
			 for (i = attlvl; i<want_attlvl; i++){
				 needA=needA+leveldifference[i];
			 }
			 for (i = collvl; i<want_collvl; i++){
				 needC=needC+leveldifference[i];
			 }
			 for (i = heallvl; i<want_heallvl; i++){
				 needH=needH+leveldifference[i];
			 }
			 for (i = deflvl; i<want_deflvl; i++){
				 needD=needD+leveldifference[i];
			 }
			 needA=needA-att+want_att;
			 needC=needC-col+want_col;
			 needD=needD-def+want_def;
			 needH=needH-heal+want_heal;

			 if(needA>0 || needC>0 || needD>0 || needH>0){
					 current = "Current: ";
					 need = "Needs: ";
					 net = "Net: ";

					 current += "A[L"+attlvl+","+att+"] ";
					 current += "C[L"+collvl+","+col+"] ";
					 current += "D[L"+deflvl+","+def+"] ";
					 current += "H[L"+heallvl+","+heal+"] ";

					 need += "A[L"+want_attlvl+","+want_att+"] ";
					 need += "C[L"+want_collvl+","+want_col+"] ";
					 need += "D[L"+want_deflvl+","+want_def+"] ";
					 need += "H[L"+want_heallvl+","+want_heal+"] ";
					 //@@@@
					 var needs=[];
					 if(needA>0){
						 needs.push(needA + " att");
					 }
					 if(needC>0){
						 needs.push(needC + " col");
					 }
					 if(needD>0){
						 needs.push(needD + " def");
					 }
					 if(needH>0){
						 needs.push(needH + " heal");
					 }
					 n=needs.join(" + ");

					 current += "\n";
					 need += "\n";
					 net += n+"\n";
					 n=n.replace("att",":BA_A:");
					 n=n.replace("def",":BA_D:");
					 n=n.replace("heal",":BA_H:");
					 n=n.replace("col",":BA_C:");
					 if(!insignia){
						 leech_simple=n;
					 }
					 if(data.enhancer>0) enhancer = " ("+data.enhancer +" charges)"
			 }
		 if(leech.includes("king")){
		 	leech_simple="[color=red]"+leech_simple+"[/color]";
		 }
			 if(leech.includes("insignia")){
				 var temp = leech.split("_");
				 var points = n;
				 //calculate amount of kings
				 var kingsneeded;
				 var kingpoints =0;
				 if(data.ba=="hardmode") ba=" (HM10)";

				 kingskilled = data.kingkills;
				 kingsneeded = 5-kingskilled;
				 var points = "";
				 var role = "";
				 insignia = true;
				 switch(temp[1]){
					 case 'A':
						 leech = "Attacker's insignia";
						 leech_simple = ":BA_A: Insignia";
						 points = needA;
						 role = ":BA_A:";
						 break;
					 case 'C':
						 leech = "Collector's insignia";
						 leech_simple = ":BA_C: Insignia";
						 points = needC;
						 role = ":BA_C:";
						 break;
					 case 'D':
						 leech = "Defender's insignia";
						 leech_simple = ":BA_D: Insignia";
						 points = needD;
						 role = ":BA_D:";
						 break;
					 case 'H':
						 leech = "Healer's insignia";
						 leech_simple = ":BA_H: Insignia";
						 points = needH;
						 role = ":BA_H:";
						 break;
				 }
				 if(kingsneeded>0) {
				 //work out how many kings as role
					 var kingsasrole=0;
					 for(var i=kingsneeded;i>0;i--){
						 if(points<0) break;
						 points -= 210;
						 kingsasrole++;
						 kingsneeded--;
					 }
					 leech += "/"+(kingsneeded+kingsasrole) + " king kills ";
					 leech_simple += ": " + kingsasrole;
					 if(kingsasrole>1){
						 leech_simple += " [color=red]kings[/color] as "+role;
					 }else{
						 leech_simple += " [color=red]king[/color] as "+role;
					 }
					 if(kingsneeded>0){
						 if(kingsneeded>1){
							 leech_simple += " + " +kingsneeded + " [color=red]kings[/color] as any";
						 }else{
							 leech_simple += " + " +kingsneeded + " [color=red]king[/color] as any";
						 }
					 }
					 if(points>0) leech_simple += " + " + points + " " + role + " ";
				 }
			 }
			 var ironsimple="";
			 if(data.ironman=="yes"){
				 ironman="Ironman: yes\n";
				 ironsimple=" (Ironman)";
			 }

		 	//color
		 	var rsncolor = data.rsn;
		 if(data.ba =="none"){
		 	rsncolor = "[color=orange]"+data.rsn+"[/color]";
		 }
			 //end of relevancy
			 var s0="RSN: "+data.rsn+"\nLeech: "+leech+"\n";
			 s0 += current;
			 s0 += need;
			 s0 += net;
			 s0 += ironman;
			 if(data.enhancer>0) s0 += "Enhancer charges:" +enhancer.replace(/[{()}]/g, '') + "\n";
			 s0 += "BA completed up to:" +ba.replace(/[{()}]/g, '')+ "\n";
			 s0 += "\n\n";
			 var s1="Copy and paste: \n[*] "+date+"/"+month+": "+rsncolor+" - "+leech_simple+ironsimple+enhancer+ba;
			 message="```".concat(s0.concat(s1.concat("```")));
			 channel.send(message).then(m => m.pin()).catch(console.error);;
			 //console.log(message);
			 return;
		 }
		 //start of trial
		 if(mail.subject=="trial"){
			 var data = JSON.parse(mail.text);
			 var message="```";
			 message += "RSN: " + data.rsn +"\n";
			 message += "Trialled before: " + data.before + "\n";
			 message += "Timezone: GMT" +data.timezone + "\n";
			 message += "Will guest in cc: " + data.guest + "\n";

			 var roles  = (data.roles.replace("[", "").replace("]","")).split(",");
			 message += "Roles: ";
			 for (var i = 0; i < roles.length-1; i++) {
				 message += roles[i] + " ";
				 if(roles.length-2>i){
					 message += "| ";
				 }
				 //Do something
			 }
			 message += "\n";
			 message +="```";
			 message += "Link to stats: http://services.runescape.com/m=hiscore/compare?user1="+(data.rsn).replace(/\s/g, "%20");
			 bot.channels.find("name", "trials").send(message);
		 }
	});

	m.on("attachment", function(attachment){
		console.log(attachment.path);
	});

	return m;
}
function ping(message){
	var nodemailer = require('nodemailer');
	var random = makeid();
	// create reusable transporter object using the default SMTP transport
	let transporter = nodemailer.createTransport({
											host: "xo4.x10hosting.com",
											port: 587,
											auth: {
												user: mailClient.username,
												pass: mailClient.password
											}
										});

	// setup email data with unicode symbols
	let mailOptions = {
		from: '"Queuebot" <'+mailClient.username+'>', // sender address
		to: mailClient.username, // list of receivers
		subject: 'admin-test', // Subject line
		text: random, // plain text body
	};

	// send mail with defined transport object
	transporter.sendMail(mailOptions, (error, info) => {
		 if (error) {
			message.channel.send("Test request failed.");
			return console.log(error);
		 }
		 message.channel.send("Successfully sent. Ensure this message arrives correctly.\nMessage: "+random);
		 });
}
function makeid(){
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for( var i=0; i < 20; i++ )
		text += possible.charAt(Math.floor(Math.random() * possible.length));

	return text;
}

exports.run = function(token,mailClientDetails) {
	bot.on('ready', () => {
		   console.log(new Date().toString()+'I am ready!');
		   mailClient=mailClientDetails;
		   mailListener=init();
		   mailListener.start(); // start listening
		   var x = setInterval(function(){
							   mailListener.stop();
							   },3600000);
		   });

	bot.on('disconnect', function(erMsg, code) {
		   console.log('----- Bot disconnected from Discord with code', code, 'for reason:', erMsg, '-----');
		   });

	bot.on('error', function(message) {
		   console.log(new Date().toString()+'error recieved', message);
		   });
	// log our bot in
	bot.login(token);
}
