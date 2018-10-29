const DiscordClient = require("./Classes/DiscordClient"),
    DatabaseClient = require("./Classes/Database"),
    CoinManager = require("./Classes/CoinManager")

class BotClient {
    
    constructor() {
        this.DiscordClient = new DiscordClient(this);
        this.DatabaseClient = new DatabaseClient(this);
        this.CoinManager = new CoinManager(this);
    }

}

const Client = new BotClient();