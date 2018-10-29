const Util = require("util"),
    Discord = require("discord.js"),
    fs = require("fs"),
    clean = (text) => {
        if (typeof (text) === "string")
            return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
        else
            return text;
    }


const file = {
    run: async function (Message, Client, Arguments) {
        let thing = await Client._Client.CoinManager.getBalance();
        console.log(thing);
        try {
            let code;
            if (typeof (Arguments) == "string") {
                code = Arguments;
            } else {
                code = Arguments.join(" ");
            }

            let evaled = eval(code);
            if (typeof evaled !== "string") {
                evaled = JSON.stringify(evaled);
                Message.channel.send(`\*\*INPUT:\*\* \n \`\`\`${code}\`\`\` \n \*\*OUTPUT:\*\* \n \`\`\`${clean(evaled)}\`\`\``);
            } else {
                Message.channel.send(`\*\*INPUT:\*\* \n \`\`\`${code}\`\`\` \n \*\*OUTPUT:\*\* \n \`\`\`${clean(evaled)}\`\`\``);
            }
        }
        catch (err) {
            Message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err.stack)}\n\`\`\``);
        }
    },

    config: {
        permissionLevel: 1
    }
}

module.exports = file;