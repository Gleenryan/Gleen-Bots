const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require("@discordjs/voice");



const queue = new Map();

let queue_lagu = []

module.exports = {
    name: 'playqw',
    // aliases: ['play', 'p', 'q', 'skip'],
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



        if (command == "p") {
            const song_queue = queue.get(msg.guild.id)


            console.log(args.join(" "))
            song = {}

            if (ytdl.validateURL(args[0])) {
                const song_info = await ytdl.getInfo(args[0]);
                song = { title: song_info.videoDetails.title, url: song_info.videoDetails.video_url }
            } else {
                const video_finder = async (query) => {
                    const videoResult = await ytSearch(query);
                    return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
                }

                const video = await video_finder(args.join(" "));
                if (video) {
                    song = { title: video.title, url: video.url }
                    // console.log(song.title)
                } else {
                    msg.channel.send("Error finding video.")
                }
            }
            if (!song) return msg.channel.send("Error when finding song, plz try again.")

            if (!server_queue) {



                queue.set(msg.guild.id, queue_constractor)
                queue_constractor.songs.push(song)
                queue_lagu.push(song.title)

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
                queue_lagu.push(song.title)
                console.log(queue_constractor.songs)
                return msg.channel.send(`**${song.title}** has been added to the queue!`);
            }
        } else if (command === 'skip') skip_song(msg, server_queue, msg.guild);
        else if (command === 'q') queue_list(msg, msg.guild, queue_constractor)



    }
}
// const searching = async (msg, args) => {
//     let song = {}
//     if (ytdl.validateURL(args[0])) {
//         const song_info = await ytdl.getInfo(args[0]);
//         song = { title: song_info.videoDetails.title, url: song_info.videoDetails.video_url }
//         return song
//     } else {
//         const video_finder = async (query) => {
//             const videoResult = await ytSearch(query);
//             return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
//         }

//         const video = await video_finder(args.join(" "));
//         if (video) {
//             song = { title: video.title, url: video.url }
//             return song
//             // console.log(song.title)
//         } else {
//             msg.channel.send("Error finding video.")
//         }
//     }
// }


const player = createAudioPlayer()


const video_player = async (msg, guild, song, connection) => {
    const song_queue = queue.get(guild.id)

    if (!song) {
        // song_queue.voice_channel.leave()
        connection.disconnect()
        queue.delete(guild.id)
        return
    }

    let stream = ytdl(song.url, {
        filter: 'audioonly',
        quality: 'highestaudio',
        highWaterMark: 1 << 25
    })
    stream = createAudioResource(stream);
    // console.log(song.url)


    const subcription = connection.subscribe(player)

    if (subcription) {
        try {
            player.play(stream, { seek: 0, volume: 0.4 })
            player.on(AudioPlayerStatus.Idle, () => {
                song_queue.songs.shift();
                queue_lagu.shift()
                video_player(msg, guild, song_queue.songs[0], connection);
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

// const skip_song = (msg, server_queue, guild) => {
//     const connection = joinVoiceChannel({
//         channelId: msg.member.voice.channel.id,
//         guildId: msg.guild.id,
//         adapterCreator: msg.guild.voiceAdapterCreator
//     })


//     if (!msg.member.voice.channel) return msg.channel.send('You need to be in a channel to execute this command!');
//     if (!server_queue) {
//         return msg.channel.send(`There are no songs in queue 😔`);
//     }
//     player.stop()
//     // console.log(server_queue.songs)
//     connection.disconnect()
//     queue.delete(guild.id)
//     return


// }

const queue_list = (msg, guild, queue_constractor) => {
    let list = ""
    for (let i = 0; i < queue_lagu.length; i++) {
        let song = (`${i + 1}) ${queue_lagu[i]} \n`)
        list += song
    }
    msg.reply(list)
}




