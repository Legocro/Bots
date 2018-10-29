const fs = require("fs"),
    path = require("path"),
    pathName = path.join(path.dirname(module.parent.filename).replace("\Handlers", ""), "Data", "Commands");
const file = {
    commands : {},
    load : function () {
        let commandsList = fs.readdirSync(pathName);
        for (i = 0; i < commandsList.length; i++) {
            let item = commandsList[i];
            if (item.match(/\.js$/)) {
                delete require.cache[require.resolve(path.join(pathName, item))];
                this.commands[item.slice(0, -3)] = require(path.join(pathName, item));
            }
        }
        console.log("Commands Loaded");
        return this.commands;
    }
}

module.exports = file