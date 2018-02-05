// the token of your bot - https://discordapp.com/developers/applications/me
var bot = require("./bot.js");
var token = 'paste me here'; //for token in commerical use
var debug_token = 'paste me here'; //for token in testing environment
const mailClient = {'username':'changeme','password':'changeme'}; //email client details

/*
 * Flag list, follow the format
 */
flags = [
  {
    flag: 'debug',
    description: 'uses debug token',
    execute: function(){
    	token = debug_token;
    }
  }
]

function search_flag(flag) {
	for(var i = 0; i < flags.length; i++) {
		if(flags[i].flag == flag.toLowerCase()) {
			return flags[i];
		}
	}
	return false;
}

/*
 * process arguments
 */
var numArgs = 0
process.argv.forEach(function (val, index, array) {
  if(val.startsWith('-')){
    var flag = search_flag(val.substr(1));
    if(flag){
      flag.execute();
    }else{
      console.log("unkown flag: "+val);
      process.exit(1);
    }
  }
  numArgs++;
  if(numArgs==process.argv.length){
    bot.run(token,mailClient);
  }
});
