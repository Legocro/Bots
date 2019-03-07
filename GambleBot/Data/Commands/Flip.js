const Embed = require("discord.js").RichEmbed;
const file = {
    run: async function (Message, Client, Arguments) {
        let choice = ["HEADS", "TAILS"][Math.floor(Math.random() * 2)]
        let playerChoice = Arguments[0];
        let embed = new Embed();
        let coinsToBet = parseFloat(Arguments[1]);
        embed.setTitle("Coin flip")
        .setThumbnail("https://cdn.discordapp.com/attachments/327088286252138497/500629238152691722/2000px-logo-1024x1024.png")
        .setImage("https://cdn.discordapp.com/attachments/327088286252138497/500628906001563659/580680_wondermeow_coin-flip.gif")
        .setColor("#42f474")
        .addField("Coins staked", coinsToBet)
            .addField("Result", choice, true)
            .addField("Your guess", playerChoice.toUpperCase(), true);
        if ((playerChoice.toUpperCase() !== "HEADS" && playerChoice.toUpperCase() !== "TAILS") || Number.isNaN(coinsToBet)) return Message.channel.send("Proper usage is: \`>Flip Tails/Heads coins\`")
        let playerTotalCoins = parseFloat(await Client._Client.DatabaseClient.getPoints(Message.author.id));
        if (coinsToBet*1.01 > playerTotalCoins) return Message.channel.send(`You can't bet ${coinsToBet} Coins because you only have ${playerTotalCoins}.`);
        playerTotalCoins -= coinsToBet * 1.01;
        if (playerChoice.toUpperCase() === choice) {
            let wonCoins = coinsToBet * 2  - coinsToBet;
            wonCoins = wonCoins.toPrecision(10);
            coinsToBet *= 2;
            playerTotalCoins += parseFloat(coinsToBet.toPrecision(10));
            await Client._Client.DatabaseClient.setPoints(Message.author.id, playerTotalCoins);
            embed.addField("Won coins", wonCoins).
                addField("Roll result", "WON");
            Message.channel.send({ embed });
            //Message.channel.send(`Congratulations, you won ${coinsToBet - oldCoins} Coin2Play bringing you to a total of ${playerTotalCoins} Coin2Play!`);
        } else {
            await Client._Client.DatabaseClient.setPoints(Message.author.id, playerTotalCoins);
            embed.addField("Roll result", "LOSS")
                .setColor("RED");
            Message.channel.send({ embed })
           // Message.channel.send(`Sorry, you lost ${coinsToBet} Coin2Play, you have ${playerTotalCoins} Coin2Play left.`);
        }
    },

    config: {
        permissionLevel: 0
    }
}

module.exports = file
