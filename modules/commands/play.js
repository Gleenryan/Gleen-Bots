const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, getVoiceConnection } = require("@discordjs/voice");

const queue = new Map()
play_trigger = ['play', 'p']
// if (play_trigger.some(word => command.includes(word)))


module.exports = {
    name: 'play',
    aliases: ['play', 'p', 'q', 'r', 'dc', 'skip'],
    description: 'play a song',
    async execute(msg, args, command, client,) {

        const server_queue = queue.get(msg.guild.id);
        const voice_channel = msg.member.voice.channel;

        const queue_constractor = {
            voice_channel: voice_channel,
            text_channel: msg.channel,
            connection: null,
            playing: true,
            songs: [],
            songDispatcher: null
        }

        if (!voice_channel) return msg.channel.send('You need to be in a channel!')

        if (command == 'p') {
            if (!args[0]) return msg.reply("Input your song / url")

            song = await search(msg, args)
            if (!song) return msg.channel.send("Error when finding song, plz try again.")

            // masukkin lagu ke queue
            if (!server_queue) {

                queue.set(msg.guild.id, queue_constractor)
                queue_constractor.songs.push(song)
                // /////////////////////////////////////////


                try {
                    const connection = await joinVoiceChannel({
                        channelId: msg.member.voice.channel.id,
                        guildId: msg.guild.id,
                        adapterCreator: msg.guild.voiceAdapterCreator
                    })
                    queue_constractor.connection = connection


                    video_player(msg, msg.guild, queue_constractor.songs[0], connection)
                } catch (err) {
                    queue.delete(msg.guild.id)
                    msg.channel.send("There was an error connecting, plz try again later")
                    throw err
                }
            } else {
                server_queue.songs.push(song)
                return msg.channel.send(`**${song.title}** has been added to the queue!`)
            }
            // ////////////////////////////////////////////////////////////////////////////////


        } else if (command == 'q') show_queue(msg);
        else if (command == 'r') remove_song(msg, args);
        else if (command == 'dc') disconnect(msg);
        else if (command == 'skip') skip_song(msg);

    }



}
const player = createAudioPlayer()
const video_player = async (msg, guild, song, connection) => {
    const song_queue = queue.get(guild.id)
    // if (song_queue.songs[0] == undefined) {
    //     connection.disconnect()
    //     queue.delete(guild.id)
    //     return
    // }
    // if (!song) {
    //     song_queue.voice_channel.leave();
    //     queue.delete(guild.id);
    //     return;

    let stream = await ytdl(song.url, {
        filter: 'audioonly',
        quality: 'highestaudio',
        highWaterMark: 1 << 25
    })
    stream = createAudioResource(stream);

    const subcription = connection.subscribe(player)

    if (subcription) {


        player.play(stream, { seek: 0, volume: 0.4 })
        player.on(AudioPlayerStatus.Idle, () => {
            song_queue.songs.shift();

            // if (song_queue.songs[0] == undefined) {
            //     // connection.disconnect()
            //     queue.delete(guild.id)
            //     return
            // }
            play_next(msg, guild, song_queue.songs[0], connection);


        });
        player.on('error', error => {
            console.error(error)
        })


        await msg.channel.send(`Now Playing : **${song.title}**`)
        // await song_queue.channel.send(`Now Playing : **${song.title}**`)


    }


}
const play_next = async (msg, guild, song, connection) => {
    const song_queue = queue.get(guild.id)
    if (song == undefined) {
        connection.disconnect()
        queue.delete(guild.id)
        return
    } else {
        video_player(msg, guild, song_queue.songs[0], connection)
        return
    }
}
const search = async (msg, args) => {
    if (ytdl.validateURL(args[0])) {
        const song_info = await ytdl.getInfo(args[0]);
        song = { title: song_info.videoDetails.title, url: song_info.videoDetails.video_url }
        return song
    } else {
        const video_finder = async (query) => {
            const videoResult = await ytSearch(query);
            return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
        }

        const video = await video_finder(args.join(" "));
        if (video) {
            song = { title: video.title, url: video.url }
            return song
            // console.log(song.title)
        } else {
            msg.channel.send("Error finding video.")
        }
    }
}

const show_queue = async (msg) => {
    try {
        const server_queue = queue.get(msg.guild.id)
        let queue_lagu = server_queue.songs

        let list = "Playing : "

        for (let i = 0; i < queue_lagu.length; i++) {
            let song = (`${i + 1}) ${queue_lagu[i].title} \n`)
            list += song
        }
        await msg.reply(list)
    } catch (err) {
        msg.channel.send("There is no song / error")
        throw err
    }

}



const remove_song = async (msg, args) => {
    const server_queue = queue.get(msg.guild.id)
    let queue_lagu = server_queue.songs
    let number = parseInt(args[0]) - 1

    msg.reply(`**${queue_lagu[number].title}** has been removed from the queue!`)
    queue_lagu.splice(queue_lagu[number], 1)

}

const disconnect = async (msg) => {
    const connection = getVoiceConnection(msg.guild.id);
    connection.destroy();
    queue.delete(msg.guild.id)
    msg.reply("Disconnected!")

}

const skip_song = async (msg) => {
    player.stop()
    msg.reply("Skipped ⏭️")
}