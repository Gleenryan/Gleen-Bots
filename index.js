const config = require("./config.json");
const { Client, Intents, DiscordAPIError, Collection, Message } = require("discord.js");
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES] });
const fs = require("fs");
const PREFIX = "-";


client.commands = new Collection();
const commandFiles = fs.readdirSync("./modules/commands/").filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
    const command = require(`./modules/commands/${file}`);

    client.commands.set(command.name, command);
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~Array~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//Array for Status
const Status_bot = ["Music Bot", "Music Bot", "-info for some info"];
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


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
    if (msg.author.bot) return

    if (!msg.content.startsWith(PREFIX)) return

    const args = msg.content.slice(PREFIX.length).split(" ");
    const command = args.shift().toLowerCase();

    const cmd = client.commands.find(a => a.aliases && a.aliases.includes(command))
    if (cmd) cmd.execute(msg, args, command)

    // if (command == 'ping') {
    //     client.commands.get('ping').execute(msg, args);

    // }

    // if (command == 'motivasi') {
    //     client.commands.get('motivation').execute(msg)
    // }

    if (command == 'info') {
        info_msg = fs.readFileSync("./editable/info_msg.txt", "utf-8");
        msg.reply(info_msg.toString())
    }

    // if (command == 'p') {
    //     if (!args.length) return msg.channel.send("no tittle song detected!, plz try again")
    //     client.commands.get('play').execute(msg, args, command, client)


    // }

})

// loggin in
client.login(config.token);
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~