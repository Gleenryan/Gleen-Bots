module.exports = {
    name: 'ping',
    aliases: ["pong", "pang", "pung"],
    description: 'ping',
    execute(msg, args) {
        bol = "uno" + args

        msg.channel.send(bol)

    }
}