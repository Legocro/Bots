const Discord = require("discord.js"); const fs = require("fs"); const { stringify } = require('querystring'); const { request } = require('https'); const client = new Discord.Client(); const DB = require("./Classes/Database"); 
const Coins = require("./Classes/CoinManager"); const DatabaseClient = new DB({}); const CoinManager = new Coins({}); module.exports = {
    DatabaseClient: DatabaseClient,
    CoinManager: CoinManager
}
const openGames={}; const games={}; const userLoad=require('./users.json'); const users={}; const guilds={};

const subjects=require('./subjects.json'); const helpr=require('./helpRequests.json'); const drafts={};

/* const history=require('./history.json');

console.log('Scanning history...'); for(var g in history){
	console.log("Scanning '"+g+"'");
	var cleared=0;
	for(var c in history[g]){
		var OMB='';//one message back
		for(var m in history[g][c]){
			if(OMB==history[g][c][m].msg){
				delete history[g][c][m];
				cleared++;
			}
			else{
				OMB=history[g][c][m].msg;
			}
		}
	}
	console.log('Cleared '+cleared+' spam messages.');
}
console.log('Done scanning history.');

//const history={}; */ let pre="^";

let gameCount=0; let userCount=0;

const gameNames=['tic tac toe','connect-4','othello','texas holdem','no limit holdem','taboo','kalah'];

function DM(id,msg){
	client.fetchUser(id).then(x=>x.send(msg));
};

function load(){
	for(let i in userLoad){
		users[i]=userLoad[i];
		users[i].current={};
		userCount++;
	}
};
load(); function save(){
	let data = JSON.stringify(users,null,2);
	
	fs.writeFile('./users.json', data, (err) => {
		if (err) throw err;
		//console.log('User data saved.');
	});
	
	let data2 = JSON.stringify(subjects,null,2);
	
	fs.writeFile('./subjects.json', data2, (err) => {
		if (err) throw err;
	});
	
	let data3 = JSON.stringify(helpr,null,2);
	
	fs.writeFile('./helpRequests.json', data3, (err) => {
		if (err) throw err;
	});
	/*
	let data4 = JSON.stringify(history);
	
	fs.writeFile('./history.json', data4, (err) => {
		if (err) throw err;
	});
	*/
};
//}

let gameF=[]; for(var i=0;i<gameNames.length;i++){
	gameF.push(require('./'+gameNames[i].replace(/ /g,'-')+'.js'));
};

function newGame(game,host,server){
	return(new gameF[game].game(host,server));
};
function gameJoin(game,player){
	return(game.join(player,users));
};
function startGame(game){
	return(game.start(users));
};
function gameAction(game,m,player){
	return(game.action(m,player,users,games,openGames,DM));
};
function quitGame(game,player){
	return(game.quit(player,users,games,openGames,DM));
};
function gameAny(game,m,player){
	return(game.any(m,player,users,games,openGames,DM));
};
//}
const help={
	help:'syntax: help <command*>\nprovides help on either all commands or a specified command',
	ping:'syntax: ping\nreplies with "pong"',
	stats:'syntax: stats <username*>\ngives statistics on either you or a specified user',
	bank:'syntax: bank\ntells you how much you have in your bank',
	game:'syntax: game list\nlists the currently supported games',
	open:'syntax: open games\nlists all open games',
	new:'syntax: new game <game> <buy-in*>\ncreates a new open game of the game specified (chosen from the game list). If a buy-in is specified, it will go into the pot and anyone who joins must pay that buy-in',
	join:'syntax: join <@host>\nlets you join a game with a given game host. You must mention the host.',
	quit:'syntax: quit <reason*>\nlets you quit and forfeit a game you\'re in',
    leave: 'syntax: leave <reason*>\nlets you leave and forfeit a game you\'re in',
    address: 'syntax: address',
    register: 'syntax: register',
    withdraw: 'syntax: withdraw <address> <amount>\n Sends <amounts> Coin2Play to <address>, used to withdraw points from the bots database to your wallet. The bot takes a 5% transaction fee.'
};
const GeneralCommands = {
    register: async function (msg, args) {
        let address = await CoinManager.createAddress(msg.author.id);
        let balance = await CoinManager.registerBalanceFromAddress(msg.author.id, address).catch(console.error);
        if (balance) {
            users[msg.author.id].bank += balance;
            return ("Updated with a balance of " + balance + " Coin2Play");
        } else {
            return ("No new balanace to update");
        }
    },
    address: async function (msg, args) {
        let Address = await CoinManager.createAddress(msg.author.id);
        return "Your uniqure Coin2Play address is: " + Address;
    },
    withdraw: async function (msg, args) {
        let args2 = msg.content.split(" ").slice(1);
        let amount = parseFloat(args2[0]);
        let address = args2[1];
        let playerCoins = await DatabaseClient.getPoints(msg.author.id);
        let botCoinAmount = await CoinManager.getBalance();
        if (amount*1.05 > playerCoins) return ("You don't have that many Coin2Play to withdraw.");
        if (amount*1.05 > botCoinAmount) return ("Unfortunately the bot doesn't have enough Coin2Play to fulfil your request currently.");
        playerCoins -= amount * 1.05;
        users[msg.author.id].bank -= amount * 1.05;
        await DatabaseClient.setPoints(msg.author.id, playerCoins);
        await CoinManager.sendCoins(amount, address);
        return (`${amount} Coin2Play has been sent to: ${address}\n ${amount*1.05} has been deducted from your account`)
    },
	help:function(msg,args){
		if(args.length===0){
			msg.author.send("```md\nHelp\n====\n * The prefix "+pre+" must be used at the beginning of any bot command *\n\n"+
                "General Commands\n================\n" +
                "address Get your unique Coin2Play address to deposit coins into\n\n" +
                "register Register the deposited coins to your account\n\n" +
                "withdraw <amount> <address> Withdraw coins from the bot to the address\n\n"+
				"help <command*> - The help command, with an optional command specific help argument\n\n"+
				"ping - responds with 'pong'\n\n"+
				"stats <username*> - gives you stats on a given user. Default is yourself\n\n"+
			"Game Commands\n=============\n"+
				"bank - tells you how much you have in your bank\n\n"+
				"game list - lists the currently supported games\n\n"+
				"new game <game> <buy-in*> - creates a new open game of the game specified (chosen from the game list)\n\n"+
				"open games - lists all open games\n\n"+
				"join <@host> - lets you join a game with a given game host\n\n"+
				"quit game - lets you quit and forfeit a game you're in"+
			"\n```\nCheck out Coin2Play here: https://coin2play.io/");
			return('Check your DMs.');
		}
		else{
			if(help[args[0]]){
				return(help[args[0]]);
			}
			else{return(args[0]+' is not a supported function.');}
		}
	},
	ping:function(){
		return('Ping!');
	}
};
const GameCommands={
	/*vote:function(msg){
		if(users[msg.author.id].hasOwnProperty('lastVote')){
			let a=users[msg.author.id].lastVote;
			if(Math.floor((Date.now()-a)/86400000)<1){
				let now=86400000-(Date.now()-a);
				let left=[
					Math.floor(now/3600000),
					Math.floor((now/60000)%60),
					Math.floor((now/1000)%60)
				];
				return('You still have '+
					(left[0]?left[0]+' hour'+(left[0]==1?' ':'s '):'')+
					(left[1]?left[1]+' minute'+(left[1]==1?' ':'s and '):(left[0]?' and ':''))+
					(left[2]?left[2]+' second'+(left[2]==1?' ':'s '):' 1 second ')+
					'before you can vote again.');
			}
			else{
				users[msg.author.id].lastVote=Date.now();
			}
		}
		else{
			users[msg.author.id].lastVote=Date.now();
		}
		users[msg.author.id].bank+=5;
		return('You can vote here! Here\'s $5 for your troubles.\nhttps://discordbots.org/bot/395669095665762304/vote');
	},
	subjects:function(){
		return(subjects.join(', '));
	},
	/*mentor:function(msg,args){
		if(args.length==0){
			let p=users[msg.author.id];
			try{
			return({embed:{
				title:p.nick+"'s mentor stats",
				fields:[
					{name:'Helped',value:p.rated,inline:true},
					{name:'Rating',value:p.rated>0?''+(Math.round((p.rating-p.rated/2)*100)/100):'N/A',inline:true},
					{name:'Skills',value:p.can.length==0?'None':p.can.join(', ')},
					{name:'Requesting',value:helpr.hasOwnProperty(msg.author.id)?helpr[msg.author.id].details:'N/A'},
				],
				color: 3447003
			}});
			}catch(e){
				return('I need embed permissions in this channel.');
			}
		}
		if(args[0]=='can'){
			if(args.length<2){
				return("Please specify which of these you are proficient in with "+pre+"mentor can <subject-1, subject-2, ...>\n"+subjects.join(', '));
			}
			let added=[];
			let arg=args.map(x=>x.replace(/\,/g,''));
			for(var i=1;i<arg.length;i++){
				if(subjects.indexOf(arg[i])>-1&&users[msg.author.id].can.indexOf(arg[i])<0){
					users[msg.author.id].can.push(arg[i]);
					added.push(arg[i]);
				}
			}
			if(added.length==0){
				return('No valid subjects were listed.');
			}
			users[msg.author.id].can.sort();
			return('The follwing subjects were added to your skills list: '+added.join(', '));
		}
		if(args[0]=="can't"){
			if(args.length<2){
				return("Please specify which of these you no longer want to mentor in "+pre+"mentor can <subject-1, subject-2, ...>\n"+users[msg.author.id].can.join(', '));
			}
			let removed=[];
			let arg=args.map(x=>x.replace(/\,/g,''));
			for(var i=1;i<args.length;i++){
				if(users[msg.author.id].can.indexOf(args[i])>-1&&users[msg.author.id].can.indexOf(arg[i])>=0){
					users[msg.author.id].can.splice(users[msg.author.id].can.indexOf(args[i]),1);
					removed.push(args[i]);
				}
			}
			if(removed.length==0){
				return('No valid subjects were listed.');
			}
			return('The follwing subjects were removed from your skills list: '+removed.join(', '));
		}
		if(args[0]=='help'){
			if(args.length<2){
				if(drafts.hasOwnProperty(msg.author.id)){
					return('Please choose atleast one subject.');
				}
				return('Please specify what you need help with.\n\n'+pre+'mentor help <details>');
			}
			if(drafts.hasOwnProperty(msg.author.id)){
				let subj=[];
				for(let i=1;i<args.length;i++){
					let sub=subjects.indexOf(args[i].replace(/\,/g,''));
					if(sub>-1){
						subj.push(subjects[sub]);
					}
				}
				if(subj.length==0){
					return("None of those are valid subjects, please choose only from the list provided.");
				}
				helpr[msg.author.id]={details:drafts[msg.author.id],subjects:subj,help:false};
				let possible=[];
				for(let i in users){
					let match=0;
					for(let j in subj){
						if(users[i].can.indexOf(subj[j])>-1){
							match++;
						}
					}
					if(match>0&&i!=msg.author.id&&(users[i].rated<10?true:users[i].rating-users[i].rated/2>=0)){
						possible.push([match*5+(users[i].rating-users[i].rated/2),i]);
					}
				}
				possible.sort((a,b)=>b[0]-a[0]);
				let cnt=0;
				for(var i=0;i<possible.length&&i<10;i++){
					cnt++;
					DM(possible[i][1],"<@"+msg.author.id+"> needs help with "+drafts[msg.author.id]);
				}
				delete drafts[msg.author.id];
				return('A message has been sent to '+cnt+' potential mentors.');
			}
			drafts[msg.author.id]=msg.content.replace(pre+'mentor help ','');
			return("Great! Now please tell me what subjects that falls under with "+pre+"mentor help <subject-1, subject-2, ...>\nYou can choose from: "+subjects.join(', '));
		}
		if(args[0]=='rate'){
			if(!helpr.hasOwnProperty(msg.author.id)){
				return("You don't have a mentor request pending completion.");
			}
			if(args.length<3){
				return(pre+'mentor rate <user> <rating 1-10>');
			}
			let m=args[1].replace('<@','').replace('!','').replace('>','');
			if(!users.hasOwnProperty(m)){
				return("That user isn't in my database.");
			}
			if(msg.author.id==m){
				return("You can't rate yourself.");
			}
			if(m!=helpr[msg.author.id].help){
				return("That person didn't pull your ticket.");
			}
			let rat=parseInt(args[2]);
			if(rat>0&&rat<=10){
				users[m].rating+=rat/10;
				users[m].rated++;
				delete helpr[msg.author.id];
				if(rat>7){
					users[m].bank+=rat*20-150;
					return("You gave <@"+m+"> a lovely rating, earning them $"+(rat*20-150)+"!");
				}
				if(rat<5){
					users[m].bank+=rat*20-150;
					return("I'm sorry for your poor experience. If you still need help, please make another mentor request.");
				}
				return("Thank you for your feedback.");
			}
			return("must be a rating 1-10");
		}
		if(args[0]=='ticket'){
			if(args.length<2){
				return(pre+'mentor ticket <user>');
			}
			let m=args[1].replace('<@','').replace('!','').replace('>','');
			if(!users.hasOwnProperty(m)){
				return("That user isn't in my database.");
			}
			if(!helpr.hasOwnProperty(m)||helpr[m].help){
				return("That user doesn't have an open mentor request.");
			}
			if(m==msg.author.id){
				delete helpr[m];
				return('You have deleted your mentor request.');
			}
			if(users[msg.author.id].rated>15&&users[msg.author.id].rating-users[msg.author.id].rated*0.8>=0){
				return('You are too poorly rated, and not considered a good enough mentor.');
			}
			helpr[m].help=msg.author.id;
			DM(m,"<@"+msg.author.id+"> has pulled your ticket, they should be helping you shortly, feel free to DM them if they don't.");
			return("You have pulled <@"+m+">'s ticket, please be expedient in helping them.");
		}
		if(subjects.indexOf(args[0])>-1){
			let sub=args[0];
			let ans=[];
			let cnt=0;
			for(let i in helpr){
				if(helpr[i].subjects.indexOf(sub)>-1){
					ans.push({name:'<@'+i+'>',value:helpr[i].details});
					cnt++;
					if(cnt>=10){
						break;
					}
				}
			}
			try{
			return({embed:{
				title:sub,
				fields:ans,
				color: 3447003
			}});
			}catch(e){
				return('I need embed permissions in this channel.');
			}
		}
		return("That's not a valid "+pre+"mentor command.");
	},
	*/pre:function(msg,args){
		if(args.length==0){
			return('No prefix was given.');
		}
		pre=args[0];
		client.user.setGame(`${pre}help | ${client.guilds.size} guilds`);
		return('The prefix is now '+pre);
	},

	bank:function(msg){
		return('$'+users[msg.author.id].bank);
	},
	game:function(){
		return(
		"```markdown\nGames\n=====\n"+
			"<Buy In> Tic Tac Toe - A simple 3-in-a-row game.\n"+
			"<Buy In> Connect-4 - A simple 4-in-a-row game.\n"+
			"<Buy In> Othello - A game of collecting territory.\n"+
			"<Poker> Texas Holdem - The most popular poker variant\n"+
			"<Poker> No Limit Holdem - Texas Holdem, but without a limit\n"+
		"```");
	},
	open:function(msg){
		let ans="```md\nOpen games\n==========";
		let gms=openGames[msg.guild.id];
		for(let i in gms){
			ans+="\n"+games[msg.guild.id][i].players.length+"/"+games[msg.guild.id][i].max+" "+gameNames[games[msg.guild.id][i].game]+" - host: "+users[i].nick+(games[msg.guild.id][i].buyIn>0?" * Buy-In: $"+games[msg.guild.id][i].buyIn+' *':'');
		}
		ans+="```";
		return(ans);
	},
	stats:function(msg,args){
		if(args.length===0){
			let p=users[msg.author.id];
			try{
			return({embed:{
				title:p.nick+"'s stats",
				fields:[
					{name:'Bank',value:'$'+p.bank,inline:true},
					{name:'Won',value:p.won+"/"+p.played,inline:true},
					{name:'Tied',value:p.tied,inline:true},
					{name:'Quit',value:p.quit,inline:true},
					{name:'Net Gambling Winnings',value:(p.netwin<0?"-":"")+"$"+Math.abs(p.netwin),inline:true},
					{name:'Mentor Rating',value:p.rated>0?''+(Math.round((p.rating-p.rated/2)*100)/100):'N/A',inline:true},
				],
				footer:{text:p.current.hasOwnProperty(msg.guild.id)?"Currently playing "+gameNames[games[msg.guild.id][p.current[msg.guild.id]].game]:"Not currently in a game on this server."},
				color: 3447003
			}});
			}catch(e){
				return('I need embed permissions in this channel.');
			}
		}
		else{
			let m=args[0].replace('<@','').replace('!','').replace('>','');
			if(!users.hasOwnProperty(m)){
				return("That user isn't in my database.");
			}
			let p=users[m];
			try{
			return({embed:{
				title:p.nick+"'s stats",
				fields:[
					{name:'Bank',value:'$'+p.bank,inline:true},
					{name:'Won',value:p.won+"/"+p.played,inline:true},
					{name:'Tied',value:p.tied,inline:true},
					{name:'Quit',value:p.quit,inline:true},
					{name:'Net Gambling Winnings',value:(p.netwin<0?"-":"")+"$"+Math.abs(p.netwin),inline:true},
					{name:'Mentor Rating',value:p.rated>0?''+(Math.round((p.rating-p.rated/2)*100)/100):'N/A',inline:true},
				],
				footer:{text:p.current.hasOwnProperty(msg.guild.id)?"Currently playing "+gameNames[games[msg.guild.id][p.current[msg.guild.id]].game]:"Not currently in a game on this server."},
				color: 3447003
			}});
			}catch(e){
				return('I need embed permissions in this channel.');
			}
		}
	},
	quit:function(msg){
		if(users[msg.author.id].current.hasOwnProperty(msg.guild.id)){
			return(quitGame(games[msg.guild.id][users[msg.author.id].current[msg.guild.id]],msg.author.id));
		}
		else{
			return("You aren't in a game on this server so you can't quit! MUHAHAHA!");
		}
	},
	leave:function(msg){
		if(users[msg.author.id].current.hasOwnProperty(msg.guild.id)){
			return(quitGame(games[msg.guild.id][users[msg.author.id].current[msg.guild.id]],msg.author.id));
		}
		else{
			return("Who do you think you are, trying to leave a game you're not even in?");
		}
	},
	new: async function(msg,args){
		if(users[msg.author.id].current.hasOwnProperty(msg.guild.id)){
			return("You can't start a new game in a server where you're already participating in another game.");
		}
		let mm=args.shift();
		let buyIn=0;
		if(Math.abs(parseInt(args[args.length-1]))>0){
			buyIn=Math.abs(parseInt(args[args.length-1]));
			args.pop();
			if(users[msg.author.id].bank<buyIn*1.02){
				return("You can't afford your own Buy-in!");
			}
            users[msg.author.id].bank -= buyIn*1.02;
            await DatabaseClient.setPoints(msg.author.id, users[msg.author.id].bank);
		}
		let m=args.join(' ');
		let good=false;
		for(let i=gameNames.length-1;i>=0;i--){
			if(m===gameNames[i]){
				games[msg.guild.id][msg.author.id]=newGame(i,msg.author.id,msg.guild.id);
				games[msg.guild.id][msg.author.id].buyIn=buyIn;
				games[msg.guild.id][msg.author.id].pot=buyIn;
				openGames[msg.guild.id][msg.author.id]=i;
				users[msg.author.id].current[msg.guild.id]=msg.author.id;
				let txt="A new game of "+gameNames[i]+" has been successfully created!";
				i=0;
                good = true;
                console.log(txt);
				return txt;
			}
		}
		if(!good){
			return('sorry, '+m+' is not currently supported.');
		}
	},
	join:async function(msg,args){
		if(users[msg.author.id].current.hasOwnProperty(msg.guild.id)){
			return("You can't join a game in a server where you're already participating in another game.");
		}
		if(args.length===0){
			return("There you go, you're all alone. Happy?");
		}
		let m=args[0].replace('<@','').replace('!','').replace('>','');
		if(openGames[msg.guild.id].hasOwnProperty(m)){
			const game=games[msg.guild.id][m];
			if(users[msg.author.id].bank<game.buyIn*1.02){
				return("This game has a buy-in of $"+game.buyIn+" and you only have $"+users[msg.author.id].bank+".");
			}
            users[msg.author.id].bank -= game.buyIn * 1.02;
            await DatabaseClient.setPoints(msg.author.id, users[msg.author.id].bank)
			game.pot+=game.buyIn;
			gameJoin(game,msg.author.id);
			users[msg.author.id].current[msg.guild.id]=m;
			if(game.max===game.players.length){
				delete openGames[msg.guild.id][m];
			}
                        if (game.min === game.players.length) {
				msg.channel.send("<@"+msg.author.id+"> joined <@"+m+">'s game of "+gameNames[game.game]);
				return(await startGame(game));
			}
            else {
				return("<@"+msg.author.id+"> joined <@"+m+">'s game of "+gameNames[game.game]);
			}
		}
		else{
			return("<@"+m+"> isn't hosting a joinable game right now.");
		}
	}
};
const devCommands={
	guilds:function(){
		let txt='';
		for(let i of client.guilds){
			//console.log(i[1]);
			let l=10-(''+i[1].memberCount).length;
			//txt+='\n'+i[1].name+':'+Array(l<0?0:l).join(' ')+i[1].memberCount+' users';
			txt+='\n'+Array(l<0?0:l).join(' ')+i[1].memberCount+' users: '+i[1].name;
		}
		//console.log(txt);
		if(txt.length<1990){
			return('```md'+txt+'```');
		}
		return("GamBit is currently in "+client.guilds.size+" guilds.");
	},
	users:function(){
		return("There are currently "+userCount+" users in my database.");
	},
	subject:function(msg,args){
		if(args.length>0){
			subjects.concat(args);
			for(var i=0;i<args.length;i++){
				subjects.push(args[i].replace(',',''));
			}
			return('Added the following to the subjects list: '+args.join(', '));
		}
		return('No subjects were named');
	},
	ban:function(msg,args){
		if(args.length>0){
			let m=args[0].replace('<@','').replace('!','').replace('>','');
			if(!users.hasOwnProperty(m)){
				return("That user isn't in my database.");
			}
			if(msg.author.id===m){
				return("Are you sure about that?");
			}
			users[m].banned=true;
			return(":hammer:");
		}
		return('Please specify a user');
	},
	unban:function(msg,args){
		if(args.length>0){
			let m=args[0].replace('<@','').replace('!','').replace('>','');
			if(!users.hasOwnProperty(m)){
				return("That user isn't in my database.");
			}
			if(msg.author.id===m){
				return("Really?");
			}
			users[m].banned=false;
			return(":wave:");
		}
		return('Please specify a user');
	},
	/*fund:function(msg,args){
		if(args.length>0){
			let v=parseInt(args[0]);
			if(!v){
				return('error');
			}
			users[msg.author.id].bank+=v;
			return("Okay, I gave you $"+v+". Spend it wisely.");
		}
		return('Please specify a value.');
	},*/
	games:function(msg,args){
		let ans="```md\nGames\n=====";
		for(let j in games){
			ans+='\n\n'+guilds[j].name+'\n'+Array((guilds[j].name).length+1).join('=');
			for(let i in games[j]){
				ans+="\n"+games[j][i].players.length+"/"+games[j][i].max+" "+gameNames[games[j][i].game]+" - host: "+users[i].nick+(games[j][i].buyIn>0?" * Buy-In: $"+games[j][i].buyIn+' *':'');
			}
		}
		ans+="```";
		return(ans);
	},
	opengames:function(msg,args){
		let ans="```md\nOpen games\n==========";
		for(let j in openGames){
			ans+='\n\n'+guilds[j].name+'\n'+Array((guilds[j].name).length+1).join('=');
			for(let i in openGames[j]){
				ans+="\n"+games[j][i].players.length+"/"+games[j][i].max+" "+gameNames[games[j][i].game]+" - host: "+users[i].nick+(games[j][i].buyIn>0?" * Buy-In: $"+games[j][i].buyIn+' *':'');
			}
		}
		ans+="```";
		return(ans);
	}
};
//}

client.on('ready', () => {
	console.log(`${client.user.tag} online`);
	//client.user.setGame(`^help | ${userCount} users`,'https://www.twitch.tv/efhiii');
	client.user.setGame(`^help | ${client.guilds.size} guilds`);
});
client.on('message', async msg => {
	//console.log(msg.author.tag+": "+msg.content);
	if(msg.author.bot){return;}
	if(users.hasOwnProperty(msg.author.id)&&users[msg.author.id].banned){return;}
	let g='PM';
	if(msg.guild){
		g=msg.guild.name;
	}
	let m=msg.content.toLowerCase();
	if(msg.guild&&users.hasOwnProperty(msg.author.id)&&users[msg.author.id].current.hasOwnProperty(msg.guild.id)){
		let game=games[msg.guild.id][users[msg.author.id].current[msg.guild.id]];
		if(game&&game.hasOwnProperty('anys')){
			let txt=gameAny(game,m,msg.author.id);
			if(Array.isArray(txt)){
				for(let i=0;i<txt.length;i++){
					msg.channel.send(txt[i]);
				}
			}
			else if(txt!==''){
				msg.channel.send(txt);
			}
		}
	}
	if(m.indexOf(pre)!=0){
		if(m[0]==='`'){
			m=m.substr(1,m.length-2);
			if(msg.guild&&users.hasOwnProperty(msg.author.id)&&users[msg.author.id].current.hasOwnProperty(msg.guild.id)){
				//console.log(msg.author.tag+": "+g+': '+msg.content);
				let txt=gameAction(games[msg.guild.id][users[msg.author.id].current[msg.guild.id]],m,msg.author.id);
				if(Array.isArray(txt)){
					for(let i=0;i<txt.length;i++){
						msg.channel.send(txt[i]);
					}
				}
				else if(txt!==''){
					msg.channel.send(txt);
				}
			}
		}
		/*
		else if(msg.content.length>10&&msg.guild){
			if(!history.hasOwnProperty(msg.guild)){
				history[msg.guild]={};
			}
			if(!history[msg.guild].hasOwnProperty(msg.channel)){
				history[msg.guild][msg.channel]={};
			}
			history[msg.guild][msg.channel][Date.now()]={msg:msg.content,from:msg.author.id};
		}
		save();
		*/
		return;
	};
	m=m.replace(pre,'');
	m = m.split(" ");
    let cmd = m.shift();
	if(GeneralCommands.hasOwnProperty(cmd)){
        console.log(msg.author.tag + ": " + g + ': ' + msg.content);
        let textToSend = await GeneralCommands[cmd](msg, m);
		msg.channel.send(textToSend);
		return;
	}
	
	if(!msg.guild){
		msg.channel.send('That command doesn\'t work in DM');
		return;
	}
	if(!openGames.hasOwnProperty(msg.guild.id)){
		openGames[msg.guild.id]={};
		guilds[msg.guild.id]=msg.guild;
	}
	if(!users.hasOwnProperty(msg.author.id)){
		users[msg.author.id]={
			nick:msg.author.username,
			played:0,
			won:0,
			lost:0,
			tied:0,
			quit:0,
			netwin:0,
			bank:0,
			banned:false,
			can:[],
			rated: 0,
			rating: 0,
			current:{}
		};
		userCount++;
		//client.user.setGame(`^help | ${userCount} users`,'https://www.twitch.tv/efhiii');
	}
	if(!games.hasOwnProperty(msg.guild.id)){
		games[msg.guild.id]={};
	}
	
	if(GameCommands.hasOwnProperty(cmd)){
		//console.log(msg.author.tag+": "+g+': '+msg.content);
        let text = await GameCommands[cmd](msg, m)
		msg.channel.send(text);
		save();
		return;
	}
	
    if (msg.author.id != 204372456339800065){
		return;
	}
	if(devCommands.hasOwnProperty(cmd)){
		console.log(msg.author.tag+": "+g+': '+msg.content);
		msg.channel.send(devCommands[cmd](msg,m));
		save();
		return;
	}
});
client.on("error" , console.error);
client.login(""); //}

