
class DatabaseClient {
    constructor() {
        this.sql = require("sqlite");
        this.start();
    }

   async start() {
        await this.sql.open("./Coins.sqlite");
        await this.sql.run("CREATE TABLE IF NOT EXISTS Coins (UserId STRING, Coins DOUBLE PRECISION, Address STRING, LastBalance DOUBLE PRECISION)").then(async () => {
            //this.sql.run(`INSERT INTO Coins (UserId, Coins, Address, LastBalance) VALUES ("${id}", 0, "xx", 0)`);
        })
        
    }

    async createRow(id) {
        let row = await this.sql.get(`SELECT * FROM Coins WHERE UserId = "${id}"`).catch(console.error)
        if (!row) {
            await this.sql.run(`INSERT INTO Coins (UserId, Coins, Address, LastBalance) VALUES ("${id}", 0, "xx", 0)`);
            console.log("New row created");
        }
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
        await this.createRow(id);
        let success = await this.sql.run(`UPDATE Coins SET Coins = ${points} WHERE UserId = "${id}"`).catch(e => console.error(e));
       // console.log(success);
    }

    async addPoints(id, points) {
        let currentPoints = await this.getPoints(id);
        this.setPoints(id, currentPoints + points);
    }

    async setAddress(id, address) {
        await this.createRow(id);
        let success = await this.sql.run(`UPDATE Coins SET Address = "${address}" WHERE UserId = "${id}"`).catch(console.error);
    }

    async getLastBalance(id) {
       // await this.createRow(id);
        let row = await this.sql.get(`SELECT LastBalance FROM Coins WHERE UserId = "${id}"`).catch(console.error);
        return row.LastBalance;
    }

    async setLastBalance(id, balance) {
        await this.createRow(id);
        let success = await this.sql.run(`UPDATE Coins SET LastBalance = ${balance} WHERE UserId = "${id}"`).catch(console.error);
    }

    async getAddress(id) {
        await this.createRow(id);
        let row = await this.sql.get(`SELECT Address FROM Coins WHERE UserId = "${id}"`).catch((e) => {
            this.sql.run("CREATE TABLE IF NOT EXISTS Coins (UserId STRING, Coins DOUBLE PRECISION, Address STRING, LastBalance DOUBLE PRECISION)").then(async () => {
                //this.sql.run(`INSERT INTO Coins (UserId, Coins, Address, LastBalance) VALUES ("${id}", 0, "xx", 0)`);
                await this.createRow(id);
            })
        });
        if (row == undefined) return "xx";
        return row.Address;
    }

}

module.exports = DatabaseClient