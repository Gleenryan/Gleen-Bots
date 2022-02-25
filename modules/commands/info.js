const { MessageEmbed } = require("discord.js")


module.exports = {
    name: 'info',
    aliases: ['info'],
    description: 'info',
    async execute(msg, args, profile_picture) {
        const Info_Embed = new MessageEmbed()
            .setColor('#88FFF7')
            .setAuthor({ name: 'Gleen', iconURL: 'https://i.postimg.cc/wvKps5Cb/Screenshot-2022-02-25-094926.png', url: 'https://linktr.ee/gleenryan' })
            .setTitle('Gleen Bot Commands')
            // .setURL('https://linktr.ee/gleenryan')
            .setDescription('Down below are comments that you can use')
            .setThumbnail('https://i.postimg.cc/wvKps5Cb/Screenshot-2022-02-25-094926.png')
            .addFields(
                { name: '-p', value: 'Play / queue song', inline: true },
                { name: '-q', value: 'Show queue', inline: true },
                { name: '-r', value: 'remove specific song from queue', inline: true },
                { name: '-skip', value: 'skip song', inline: true },
                { name: '-dc', value: 'disconnect', inline: true },
                { name: '-motivation', value: 'Give you some motivation', inline: true },
                { name: '-loop', value: 'Loop your songs', inline: true },
            )
            // .setImage('https://i.postimg.cc/wvKps5Cb/Screenshot-2022-02-25-094926.png')
            .setTimestamp()
            .setFooter({ text: 'Gleen', iconURL: 'https://i.postimg.cc/wvKps5Cb/Screenshot-2022-02-25-094926.png' });

        msg.channel.send({ embeds: [Info_Embed] })
    }

}