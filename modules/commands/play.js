const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");


const queue = new Map();

module.exports = {
    name: 'play',
    description: 'play a song',
    async execute(msg, args, command, client) {

        const voice_channel = msg.member.voice.channel;
        if (!voice_channel) return msg.channel.send('You need to be in a channel!')

        const server_queue = queue.get(msg.guild.id);

        if (command === 'p') {

            let song = {}
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
                } else {
                    msg.channel.send("Error finding video.")
                }
            }

            if (!server_queue) {

                const queue_constractor = {
                    voice_channel: voice_channel,
                    text_channel: msg.channel,
                    connection: null,
                    songs: []
                }

                queue.set(msg.guild.id, queue_constractor)
                queue_constractor.songs.push(song)

                try {
                    const connection = await voice_channel.join();
                    queue_constractor.connection = connection
                    video_player(msg.guild, queue_constractor.songs[0])
                } catch (err) {
                    queue.delete(msg.guild.id)
                    msg.channel.send("There was an error connecting, plz try again later")
                    throw err
                }

            } else {
                server_queue.songs.push(song)
                return msg.channel.send(`**${song.title}** has been added to the queue!`);
            }
        }
    }
}