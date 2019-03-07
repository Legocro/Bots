const file = {
    run: async function (Message, Client, Arguments) {
        let balance = await Client._Client.CoinManager.getBalance();
        if (balance){
        	Message.channel.send("Wallet balance: " + balance);
        }
    },

    config: {
        permissionLevel: 1
    }
}

module.exports = file;
