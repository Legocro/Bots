
class DatabaseClient {
    constructor() {
        this.sql = require("sqlite");
        this.start();
    }

    start() {
        this.sql.open("./Coins.sqlite");
    }

    async createRow(id) {
       await this.sql.run(`INSERT INTO Coins (UserId, Coins, Address, LastBalance) VALUES ("${id}", 0, "xx", 0)`);
    }

    async getPoints(id) {
        let coins = await this.sql.get(`SELECT Coins FROM Coins WHERE UserId = "${id}"`).catch((e) => {
            console.error;
            this.sql.run("CREATE TABLE IF NOT EXISTS Coins (UserId STRING, Coins DOUBLE PRECISION, Address STRING, LastBalance DOUBLE PRECISION)").then(async () => {
                //this.sql.run(`INSERT INTO Coins (UserId, Coins, Address, LastBalance) VALUES ("${id}", 0, "xx", 0)`);
                await this.createRow(id);
            })
        })
        //console.log(coins.Coins);
        if (coins != undefined) return coins.Coins;
        return 0;
    }

    async setPoints(id, points) {
	this.createRow(id);
        let success = await this.sql.run(`UPDATE Coins SET Coins = ${points} WHERE UserId = "${id}"`).catch(e => console.error(e));
    }

    async addPoints(id, points) {
	this.createRow(id);
        let currentPoints = await this.getPoints(id);
        this.setPoints(id, currentPoints + points);
    }

    async setAddress(id, address) {
	this.createRow(id);
        let success = await this.sql.run(`UPDATE Coins SET Address = "${address}" WHERE UserId = "${id}"`).catch(console.error);
    }

    async getLastBalance(id) {
	this.createRow(id);
        let row = await this.sql.get(`SELECT LastBalance FROM Coins WHERE UserId = "${id}"`).catch(console.error);
        return row.LastBalance;
    }

    async setLastBalance(id, balance) {
        let success = await this.sql.run(`UPDATE Coins SET LastBalance = ${balance} WHERE UserId = "${id}"`).catch(console.error);
    }

    async getAddress(id) {
        let row = await this.sql.get(`SELECT Address FROM Coins WHERE UserId = "${id}"`).catch((e) => {
            this.sql.run("CREATE TABLE IF NOT EXISTS Coins (UserId STRING, Coins DOUBLE PRECISION, Address STRING, LastBalance DOUBLE PRECISION)").then(async () => {
                //this.sql.run(`INSERT INTO Coins (UserId, Coins, Address, LastBalance) VALUES ("${id}", 0, "xx", 0)`);
                await this.createRow(id);
            })
        });
        //console.log(row.Address);
        if (row == undefined) return "xx";
        return row.Address;
    }

}

module.exports = DatabaseClient
