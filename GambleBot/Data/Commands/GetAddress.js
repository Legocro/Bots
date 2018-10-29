const file = {
    run: async function (Message, Client, Arguments) {
        console.log(Client._Client.CoinManager.getBalance());
    },

    config: {
        permissionLevel: 0
    }
}

module.exports = file;