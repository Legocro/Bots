
const util = require("util"),
    exec = util.promisify(require("child_process").exec);
const DB = require("./Database");
const DatabaseClient = new DB();
class CoinManager {

    constructor(Client) {
        this._Client = Client;

    }



    async createAddress(id) {
        let { stdout, stderr } = await exec("coin2play-cli getnewaddress " + id);
        if (stderr) return
        let currentAddress = await DatabaseClient.getAddress(id);
        //console.log(currentAddress);
        if (currentAddress == "xx") {
            DatabaseClient.setAddress(id, stdout);
            return stdout;
        } else {
            return currentAddress;
        }
        
    }   

    async registerBalanceFromAddress(id, address) {
        let { stdout, stderr } = await exec("coin2play-cli getreceivedbyaddress " + address);
        let lastBalance = await DatabaseClient.getLastBalance(id);
        console.log(lastBalance);
        console.log(stdout);
        if (stdout !== lastBalance) {
            let newBalance = stdout - lastBalance;
            await DatabaseClient.addPoints(id, newBalance);
            await DatabaseClient.setLastBalance(id, stdout);
            return newBalance;
        }
}
    async sendCoins(amount, address) {
        await exec("coin2play-cli sendtoaddress " + address + " " + amount);
        return amount;
    }

    async getBalance() {
        let { stdout, stderr } = await exec("coin2play-cli getwalletinfo");
        let balance = JSON.parse(stdout).balance;
        return parseInt(balance);
    }

    
}

module.exports = CoinManager;