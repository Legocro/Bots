const file = {
    run: async function (Message, Client, Arguments) {
        Message.channel.send("===Commands=== \n>Balance - Displays your balance\nAddress - Get your unique coin2play address to deposit coins to\nDice <result> <coins> - Bet coins on a roll of two dice and try to guess the result\nFlip <heads/tails> <amount> - Bet coins on a coin flip\nLuckyNumber <your_guess> <max_number> <amount> - Bet coins on guessing a number between 0 and max number (Note: max number must be at least 20)\nWithdraw <amount> <address> - Withdraw coins from the bot to your coin2play wallet address\nRegister - register the new balance after depositing to the addres you get with \`>Address\`");
},
    config: {
        permissionLevel: 0
    }
}

module.exports = file;
