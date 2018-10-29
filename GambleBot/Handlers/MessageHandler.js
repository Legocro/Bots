
const { prefix, owner } = require("../Data/settings.json");

class MessageHandler {
    constructor(Client) {
        this._Client = Client;
        this.Commands = require("../Handlers/CommandLoader").load();
        this._Client.on("message", (m) => this.handle(m));
    }

    handle(message) {
        let commands = this.Commands;
        let Client = this._Client;
        let Arguments = message.content.split(" ").slice(1);
        for (let command in commands) {
            if (message.content.startsWith(prefix + command)) {
                if (commands[command].config.permissionLevel > 0 && message.author.id !== owner) return;
                commands[command].run(message, Client, Arguments);
            }
        }
    }
}

module.exports = MessageHandler;