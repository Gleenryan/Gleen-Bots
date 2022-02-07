const config = require("./config.json");
const { Client, Intents } = require("discord.js");
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const Status_bot = ["Music Bot", "Music Bot", "-info for some info"];


client.on("ready", () => {
    console.log(`${client.user.tag} is Online`)
    setInterval(() => {
        const index = Math.floor(Math.random() * (Status_bot.length - 1) + 1);
        client.user.setActivity(Status_bot[index], { type: "WATCHING" });
    }, 10000);
});



client.login(config.token);