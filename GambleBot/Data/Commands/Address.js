const file = {

    run: async function (Message, Client, Arguments) {
        let Address = await Client._Client.CoinManager.createAddress(Message.author.id);
        Message.channel.send("Your address is: \n" + Address + "\n After depositing the coins, use \`>Register\` to register the new balance from the address.");
        try {
            Message.author.send("Your address is: \n" + Address + "\n After depositing the coins, use \`>Register\` to register the new balance from the address.");
        } catch (e) {
            console.error(e);
        }
    },

    config: {
        permissionLevel: 0
    }

}

module.exports = file;