
const util = require("util"),
    exec = util.promisify(require("child_process").exec)

class CoinManager {

    constructor(Client) {
        this._Client = Client;

    }



    async createAddress(id) {
        let { stdout, stderr } = await exec("coin2play-cli getnewaddress " + id);
        if (stderr) return
        let currentAddress = await this._Client.DatabaseClient.getAddress(id);
       // console.log(currentAddress);
        if (currentAddress == "xx") {
            this._Client.DatabaseClient.setAddress(id, stdout);
            return stdout;
        } else {
            return currentAddress;
        }
        
    }   

    async registerBalanceFromAddress(id, address) {
        let { stdout, stderr } = await exec("coin2play-cli getreceivedbyaddress " + address);
        let lastBalance = await this._Client.DatabaseClient.getLastBalance(id);
        if (stdout !== lastBalance) {
            let newBalance = stdout - lastBalance;
            await this._Client.DatabaseClient.addPoints(id, newBalance);
            await this._Client.DatabaseClient.setLastBalance(id, stdout);
            return newBalance;
        }
        if (stderr) throw new Error(stderr);
}
    async sendCoins(amount, address) {
        await exec("coin2play-cli sendtoaddress " + address + " " + amount);
    }

    async getBalance() {
        let { stdout, stderr } = await exec("coin2play-cli getwalletinfo");
        let balance = JSON.parse(stdout).balance;
        return parseInt(balance);
    }

    
}

module.exports = CoinManager;