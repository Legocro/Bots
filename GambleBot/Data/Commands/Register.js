
const file = {
    run: async function (Message, Client, Arguments) {
        let address = await Client._Client.CoinManager.createAddress(Message.author.id);
        let balance = await Client._Client.CoinManager.registerBalanceFromAddress(Message.author.id, address).catch(console.error);
        if (balance) {
            Message.channel.send("Updated with a balance of " + balance + " Coin2Play")
        }
    },

    config: {
        permissionLevel: 0
    }
}


module.exports = file;