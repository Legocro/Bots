const Embed = require("discord.js").RichEmbed;
const file = {
    run: async function (Message, Client, Arguments) {
        let embed = new Embed();
        let numberOfDice = 2;
        let playerResult = parseInt(Arguments[0]);
        let coinsToBet = parseFloat(Arguments[1]);
        if (Number.isNaN(coinsToBet) || Number.isNaN(playerResult)) return Message.channel.send("Proper usage is: \`>Dice result coins\`")
        let playerTotalCoins = parseFloat(await Client._Client.DatabaseClient.getPoints(Message.author.id));
        if (coinsToBet*1.01 > playerTotalCoins) return Message.channel.send(`You can't bet ${coinsToBet} Coins because you only have ${playerTotalCoins}.`);
        playerTotalCoins -= coinsToBet*1.01;
        let totalCoefficient = Math.pow(1.2, numberOfDice);
        let totalScore = 0;
        for (let i = 0; i < numberOfDice; i++) {
            totalScore += Math.floor(Math.random() * 6) + 1;
        }
        embed.setTitle("Dice")
            .setThumbnail("https://cdn.discordapp.com/attachments/327088286252138497/500629238152691722/2000px-logo-1024x1024.png")
            .setImage("https://cdn.discordapp.com/attachments/327088286252138497/500628974670446592/CompleteCornyGalago-max-1mb.gif")
            .setColor("#42f474")
            .addField("Coins staked", coinsToBet)
            .addField("Result", totalScore, true)
            .addField("Your guess", playerResult, true);
        if (totalScore == playerResult) {
            let wonCoins = coinsToBet * 2  - coinsToBet; 
            wonCoins = wonCoins.toPrecision(10);
            playerTotalCoins += parseFloat(wonCoins) + parseFloat(coinsToBet);
            await Client._Client.DatabaseClient.setPoints(Message.author.id, playerTotalCoins);
            embed.addField("Coins won", wonCoins);
            embed.addField("Roll result", "WON");
            Message.channel.send({ embed });
           // Message.channel.send(`Congratulations, the result of rolling ${numberOfDice} dice was ${totalScore} and you guessed it correct, you won ${wonCoins} Coins bringing you to a total of ${playerTotalCoins} Coins.`);
        } else {
            await Client._Client.DatabaseClient.setPoints(Message.author.id, playerTotalCoins);
            embed.setColor("RED");
            embed.addField("Roll result", "LOST");
            Message.channel.send({ embed })
           // Message.channel.send(`Sorry, you lost, the result of rolling ${numberOfDice} dice was ${totalScore}. You lost ${coinsToBet} Coins, you have ${playerTotalCoins} Coins left.`)
        }

    },

    config: {
        permissionLevel: 0
    }
}

module.exports = file
