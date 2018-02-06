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

function MailParser(mailClient,queue,admin){
	this.mailListener;
	this.mailClient = mailClient;
	this.queueChannel = queue;
	this.adminChannel = admin;
	this.init = function(){
		//this.queueChannel = queue;
		var MailListener = require("mail-listener2");
		var m = new MailListener({
			username: this.mailClient.username,
			password: this.mailClient.password,
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

		m.parent = this;

		m.on("server:connected", function(){
			console.log("mail server connected");
	 	});
		m.on("server:disconnected", function(){
			console.log("mail server disconnected");
			//https://github.com/chirag04/mail-listener2/issues/8 //for future
			console.log("=====reconnecting");
			m = null;
			m = this.parent.init();
		});

		m.on("error", function(err){
			console.log(err);
			m.stop();
		});

		m.on("mail", function(mail, seqno, attributes){
			//var channel = this.bot.channels.find("name", this.queueChannel);
			var month = ('0' + (new Date().getMonth() + 1)).slice(-2);
			var date = ('0' + new Date().getDate()).slice(-2);
			var message="";
			 if(mail.subject=="admin-test"){
				 this.parent.adminChannel.send("Request acknowledged and received.\nMessage: "+mail.text);
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
					this.parent.queueChannel.send(message).then(m => m.pin()).catch(console.error);;
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
				 this.parent.queueChannel.send(message).then(m => m.pin()).catch(console.error);;
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
				 //this.bot.channels.find("name", "trials").send(message);
			 }
		});
		this.mailListener=m;
		this.mailListener.start();
	};
	this.start = function(){
		this.mailListener.start();
	};
	this.stop = function(){
		this.mailListener.stop();
	};
	this.setAdminChannel = function(channel){
		this.adminChannel=channel;
	}
	this.ping = function(message){
		var nodemailer = require('nodemailer');
		var random = makeid();
		// create reusable transporter object using the default SMTP transport
		var parent = this;
		let transporter = nodemailer.createTransport({
				host: "xo4.x10hosting.com",
				port: 587,
				auth: {
					user: parent.mailClient.username,
					pass: parent.mailClient.password
			}
		});

		// setup email data with unicode symbols
		let mailOptions = {
			from: '"Queuebot" <'+parent.mailClient.username+'>', // sender address
			to: parent.mailClient.username, // list of receivers
			subject: 'admin-test', // Subject line
			text: random, // plain text body
		};

		// send mail with defined transport object
		transporter.sendMail(mailOptions, (error, info) => {
			 if (error) {
				message.channel.send("Test request failed.");
				console.error;
				return;
			 }
			 message.channel.send("Successfully sent. Ensure this message arrives correctly.\nMessage: "+random);
		 });
	}
}
function makeid(){
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for( var i=0; i < 50; i++ )
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	return text;
}

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

module.exports = {
	MailParser
}
