const config = require("./config.json");
const { Client, Intents } = require("discord.js");
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const fs = require("fs")
const fetch = require("node-fetch")

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~Array~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//Array for Status
const Status_bot = ["Music Bot", "Music Bot", "-info for some info"];
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//Array for Motivation
const Motivation_trigger = ["-motivasi", "-motivate", "-motivation"]
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//~~~~~~~~~~~~~~~~~~~~ CODING-ZONE! ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//Checking if the bot is online and setting status
client.on("ready", () => {
    console.log(`${client.user.tag} is Online`)
    setInterval(() => {
        const index = Math.floor(Math.random() * (Status_bot.length - 1) + 1);
        client.user.setActivity(Status_bot[index], { type: "WATCHING" });
    }, 10000);
});
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


client.on("messageCreate", msg => {
    // Telling the bot to not listen to itself
    if (msg.author.bot) return
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    // -info
    if (msg.content === "-info") {
        info_msg = fs.readFileSync("./editable/info_msg.txt", "utf-8");
        msg.reply(info_msg.toString());
    }
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    // -motivation
    if (Motivation_trigger.some(word => msg.content.includes(word))) {
        getQuote().then(quote => msg.reply(quote))
    }
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

})



// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~functions~~~~~~~~~~~~~~~~~~~~~~~~~~~

// -motivation
function getQuote() {
    return fetch("https://zenquotes.io/api/random")
        .then(res => {
            return res.json()
        })
        .then(data => {
            return data[0]["q"] + " -" + data[0]["a"]
        })
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// loggin in
client.login(config.token);
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~