const file = {
    run: async function (Message, Client, Arguments) {
        //console.log(await Client._Client.DatabaseClient.getPoints(Message.author));
        let points = await Client._Client.DatabaseClient.getPoints(Message.author.id);
        Message.channel.send(points);
    },

    config: {
        permissionLevel: 0
    }
}

module.exports = file
