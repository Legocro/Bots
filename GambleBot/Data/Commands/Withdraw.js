const file = {
    run: async function (Message, Client, Arguments) {
        try {
            let amount = parseFloat(Arguments[0]);
            let address = Arguments[1];
            let playerCoins = await Client._Client.DatabaseClient.getPoints(Message.author.id);
            let botCoinAmount = await Client._Client.CoinManager.getBalance();
            if (amount * 1.05 > playerCoins) return Message.channel.send("You don't have that many Coin2Play to withdraw.");
            if (amount * 1.05 > botCoinAmount) return Message.channel.send("Unfortunately the bot doesn't have enough Coin2Play to fulfil your request currently.");
            playerCoins -= amount * 1.05;
            await Client._Client.DatabaseClient.setPoints(Message.author.id, playerCoins);
            await Client._Client.CoinManager.sendCoins(amount, address);
            Message.channel.send(`${amount} Coin2Play has been sent to: ${address}\n ${amount * 1.05} has been deducted from your account`)
        } catch (e) {
            console.log(e.message);
            return Message.channel.send("Proper usage is \`>Withdraw amount address\`");
        }
    },

    config: {
        permissionLevel: 0
    }
}


module.exports = file;