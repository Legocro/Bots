const file = {
    run: async function (Message, Client, Arguments) {
        await Client._Client.DatabaseClient.setPoints(Message.author.id, Arguments[0]);
        console.log("Set points of " + Message.author.id + " to "  + Arguments[0])
    },

    config: {
        permissionLevel: 1
    }
}

module.exports = file;