const play = require("play-dl");
const ytSearch = require("yt-search");
const ytdl = require("@distube/ytdl-core");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  getVoiceConnection,
  StreamType,
} = require("@discordjs/voice");

const queue = new Map();
module.exports = {
  name: "play",
  aliases: ["play", "p", "q", "r", "dc", "skip", "loop"],
  description: "play a song",
  async execute(msg, args, command, client) {
    const server_queue = queue.get(msg.guild.id);
    const voice_channel = msg.member.voice.channel;
    if (!voice_channel) return msg.channel.send("You need to be in a channel!");

    if (command == "p") {
      if (!args[0]) return msg.reply("Input your song / URL");

      const song = await search(msg, args);
      if (!song)
        return msg.channel.send("Error finding song, please try again.");

      if (!server_queue) {
        const queue_constructor = {
          voice_channel: voice_channel,
          text_channel: msg.channel,
          connection: null,
          playing: true,
          songs: [],
          player: createAudioPlayer(),
          loop: false,
        };
        queue.set(msg.guild.id, queue_constructor);
        queue_constructor.songs.push(song);
        try {
          const connection = joinVoiceChannel({
            channelId: voice_channel.id,
            guildId: msg.guild.id,
            adapterCreator: msg.guild.voiceAdapterCreator,
          });
          queue_constructor.connection = connection;
          connection.subscribe(queue_constructor.player);
          video_player(msg.guild, msg, connection, queue_constructor.songs[0]);
        } catch (err) {
          queue.delete(msg.guild.id);
          msg.channel.send("Error connecting, please try again later.");
          throw err;
        }
      } else {
        server_queue.songs.push(song);
        return msg.channel.send(
          `**${song.title}** has been added to the queue!`
        );
      }
    } else if (command == "q") show_queue(msg);
    else if (command == "r") remove_song(msg, args);
    else if (command == "dc") disconnect(msg);
    else if (command == "skip") skip_song(msg);
    else if (command == "loop") loop_mode(msg);
  },
};

const video_player = async (guild, msg, connection, song) => {
  const song_queue = queue.get(guild.id);
  if (!song) {
    queue.delete(guild.id);
    return;
  }

  try {
    console.log("🎵 Now playing:", song.title);

    const stream = await ytdl(song.url, {
      filter: "audioonly",
      quality: "highestaudio",
      highWaterMark: 1 << 25,
      requestOptions: {
        headers: {
          cookie: process.env.YT_COOKIE || "",
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
        },
      },
    });

    const resource = createAudioResource(stream, {
      inputType: StreamType.Arbitrary,
    });
    song_queue.player.play(resource);

    console.log("▶️ Player Status:", song_queue.player.state.status);

    connection.subscribe(song_queue.player);
    msg.channel.send(`🎶 Now Playing: **${song.title}**`);

    song_queue.player.on(AudioPlayerStatus.Idle, () => {
      console.log("⏭️ Song finished playing.");
      song_queue.songs.shift();
      if (song_queue.songs.length > 0) {
        video_player(guild, msg, connection, song_queue.songs[0]);
      } else {
        connection.destroy();
        queue.delete(guild.id);
      }
    });

    song_queue.player.on("error", (err) => {
      console.error("❌ Audio Player Error:", err);
      msg.channel.send("Error playing song.");
      queue.delete(guild.id);
    });
  } catch (error) {
    console.error("❌ Error playing song:", error);
    msg.channel.send("Error playing song.");
    queue.delete(guild.id);
  }
};

const search = async (msg, args) => {
  if (play.yt_validate(args[0]) === "video") {
    const song_info = await play.video_info(args[0]);
    return {
      title: song_info.video_details.title,
      url: song_info.video_details.url,
    };
  } else {
    const videoResult = await ytSearch(args.join(" "));
    if (videoResult.videos.length > 0) {
      return {
        title: videoResult.videos[0].title,
        url: videoResult.videos[0].url,
      };
    }
    msg.channel.send("Error finding video.");
  }
};

const show_queue = async (msg) => {
  const server_queue = queue.get(msg.guild.id);
  if (!server_queue || server_queue.songs.length === 0)
    return msg.reply("There is no song in the queue");
  const list = server_queue.songs
    .map((song, i) => `${i + 1}) ${song.title}`)
    .join("\n");
  await msg.reply(list);
};

const remove_song = async (msg, args) => {
  const server_queue = queue.get(msg.guild.id);
  if (!server_queue || !server_queue.songs[args[0] - 1])
    return msg.reply("Invalid song number.");
  const removed_song = server_queue.songs.splice(args[0] - 1, 1);
  msg.reply(`**${removed_song[0].title}** has been removed from the queue!`);
};

const disconnect = async (msg) => {
  const connection = getVoiceConnection(msg.guild.id);
  if (connection) connection.destroy();
  queue.delete(msg.guild.id);
  msg.reply("Disconnected!");
};

const loop_mode = async (msg) => {
  const server_queue = queue.get(msg.guild.id);
  if (!server_queue) return msg.reply("No active queue.");
  server_queue.loop = !server_queue.loop;
  msg.reply(`Loop Mode: ${server_queue.loop ? "Enabled" : "Disabled"}`);
};

const skip_song = async (msg) => {
  const server_queue = queue.get(msg.guild.id);
  if (!server_queue || server_queue.songs.length < 2)
    return msg.reply("No song to skip.");
  server_queue.player.stop();
  msg.reply("Skipped ⏭️");
};
