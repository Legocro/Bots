const Embed = require("discord.js").RichEmbed;
const file = {
    run: async function (Message, Client, Arguments) {
        let embed = new Embed();
        let luckyNumber = parseInt(Arguments[0]);
        let totalNumbers = parseInt(Arguments[1]);
        let result = Math.floor(Math.random() * totalNumbers) + 1;
        let coinsToBet = parseFloat(Arguments[2]);
        if (Number.isNaN(coinsToBet) || Number.isNaN(luckyNumber) || Number.isNaN(totalNumbers)) return Message.channel.send("Proper usage: \`>LuckyNumber guess max_number coins\`")
        let totalCoefficient = 1.4 + (totalNumbers - 20) * 0.01;
        let playerTotalCoins = parseFloat(await Client._Client.DatabaseClient.getPoints(Message.author.id));
        embed.setTitle("Lucky number")
        .setThumbnail("https://cdn.discordapp.com/attachments/327088286252138497/500629238152691722/2000px-logo-1024x1024.png")
        .setImage("https://cdn.discordapp.com/attachments/327088286252138497/500632167957790720/your-lucky-number-winning-contest-raffle-ticket-3-d-animation_r6mvzoawg_thumbnail-full10.png")
        .setColor("#42f474")
        .addField("Coins staked", coinsToBet)
        .addField("Result", result, true)
        .addField("Your guess", luckyNumber, true);

        if (coinsToBet*1.01 > playerTotalCoins) return Message.channel.send(`You can't bet ${coinsToBet} Coins because you only have ${playerTotalCoins}.`);
        if (totalNumbers < 20) return Message.channel.send("The highest number must be at least 20 to play this game.");
        playerTotalCoins -= coinsToBet * 1.01;
        if (result == luckyNumber) {
            let wonCoins = coinsToBet * 2  - coinsToBet;
            wonCoins = wonCoins.toPrecision(10);
            playerTotalCoins += parseFloat(wonCoins + coinsToBet);
            await Client._Client.DatabaseClient.setPoints(Message.author.id, playerTotalCoins);
            embed.addField("Coins won", wonCoins)
            .addField("Roll result", "WON")
            Message.channel.send({ embed })
           // Message.channel.send(`The lucky number was ${result} and you guessed it correct! You won ${wonCoins} Coins bringing you to a total of ${playerTotalCoins} Coins`);
        } else {
            await Client._Client.DatabaseClient.setPoints(Message.author.id, playerTotalCoins);
            embed.setColor("RED")
                .addField("Roll result", "LOSS");
            Message.channel.send({ embed });
           // Message.channel.send(`Unfortunately, you lost. The lucky number was ${result}. You lost ${coinsToBet} Coins and have ${playerTotalCoins} left.`)
        }
    },

    config: {
        permissionLevel: 0
    }
}

module.exports = file


