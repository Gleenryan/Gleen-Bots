module.exports = {
    name: 'ping',
    aliases: ["pong", "pang", "pung", "ping"],
    description: 'ping',
    execute(msg, args, client) {


        msg.channel.send(`🏓Latency is ${Date.now() - msg.createdTimestamp}ms.`);

    }
}