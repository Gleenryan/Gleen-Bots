const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, getVoiceConnection } = require("@discordjs/voice");
const player = createAudioPlayer()
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



        if (!voice_channel) return msg.channel.send('You need to be in a channel!')

        if (command == 'p') {
            if (!args[0]) return msg.reply("Input your song / url")

            song = await search(msg, args)
            if (!song) return msg.channel.send("Error when finding song, plz try again.")

            // masukkin lagu ke queue
            if (!server_queue) {
                const queue_constractor = {
                    voice_channel: voice_channel,
                    text_channel: msg.channel,
                    connection: null,
                    playing: true,
                    songs: [],
                    songDispatcher: null
                }

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
                    connection.subscribe(player)

                    video_player(msg.guild, msg, connection, queue_constractor.songs[0])

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



const video_player = async (guild, msg, connection, song) => {
    const song_queue = queue.get(guild.id)

    if (!song) {
        queue.delete(guild.id);
        return;
    }


    let stream = await ytdl(song.url, {
        filter: 'audioonly',
        quality: 'highestaudio',
        highWaterMark: 1 << 25
    })
    stream = createAudioResource(stream);
    const subcription = connection.subscribe(player)
    if (subcription) {
        try {
            player.play(stream, { seek: 0, volume: 0.4 })
            song_queue.songs.shift()
            player.on(AudioPlayerStatus.Idle, () => {
                const song_queue = queue.get(guild.id)
                console.log("idlee")
                if (song_queue.songs[0] != undefined) {
                    play_next(msg.guild, msg, connection, song_queue.songs[0])

                    return
                } else {
                    connection.disconnect();


                }
            });

            await msg.channel.send(`Now Playing : **${song.title}**`)
            // await song_queue.channel.send(`Now Playing : **${song.title}**`)
        } catch (error) {
            console.log(error)
            // queue.delete(msg.guild.id)
            // msg.channel.send("There was an error connecting, plz try again later")
            throw error
        }
    }

}
const play_next = async (guild, msg, connection, song,) => {
    const song_queue = queue.get(guild.id)

    if (!song) {
        queue.delete(guild.id);
        return;
    }


    let stream = await ytdl(song.url, {
        filter: 'audioonly',
        quality: 'highestaudio',
        highWaterMark: 1 << 25
    })
    stream = createAudioResource(stream);

    try {
        player.play(stream, { seek: 0, volume: 0.4 })
        song_queue.songs.shift()

        await msg.channel.send(`Now Playing : **${song.title}**`)
        // await song_queue.channel.send(`Now Playing : **${song.title}**`)
    } catch (error) {
        console.log(error)
        // queue.delete(msg.guild.id)
        // msg.channel.send("There was an error connecting, plz try again later")
        throw error
    }


    return
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

    const server_queue = queue.get(msg.guild.id)
    let queue_lagu = server_queue.songs

    let list = ""

    for (let i = 0; i < queue_lagu.length; i++) {
        let song = (`${i + 1}) ${queue_lagu[i].title} \n`)
        list += song
    }
    if (list != "") await msg.reply(list)
    else msg.reply("There is no song in the queue")


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
    return
}