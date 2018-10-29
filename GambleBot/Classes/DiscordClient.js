const Discord = require("discord.js"),
    data = require("../Data/settings.json"),
    MessageHandler = require("../Handlers/MessageHandler");

class DiscordClient extends Discord.Client {
    constructor(MainClient) {
        super();
        this._Client = MainClient;
        this.login(data.token);
        this.on("ready", function () {
            console.log("Ready!");
        })
        this.MessageHandler = new MessageHandler(this);
    }

}

module.exports = DiscordClient;