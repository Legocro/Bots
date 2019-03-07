const file = {
	run: async function(Message, Client, Arguments) {
		
		let id = Arguments[0];
		let balance = await Client._Client.DatabaseClient.getPoints(id);
		if (balance){ Message.channel.send(id + " : " + balance);}
},
	config: {permissionLevel: 1}
}

module.exports = file;
