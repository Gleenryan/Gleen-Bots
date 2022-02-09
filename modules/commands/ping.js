module.exports = {
    name: 'ping',
    description: 'ping',
    execute(msg, args) {
        args.shift();
        bol = "uno" + args

        msg.channel.send(bol)

    }
}