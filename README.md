# Discord-Bot

A simple Discord bot made for fun and practice using [Discord.js](https://discord.js.org/).

## Features

- **Music** - Play songs and playlists from YouTube with queue, skip, stop, and loop controls
- **Dice Roller** - Roll dice using standard notation (e.g. `2d6+1d4-5`)
- **Neko** - Fetch random anime images from booru boards
- **Utility** - Ping, pong, and reboot commands

## Setup

1. Install [Node.js](https://nodejs.org/) v20 or later
2. Run `npm install`
3. Create a `.env` file in the project root:
   ```
   BOT_TOKEN=your_bot_token
   CLIENT_ID=your_client_id
   GUILD_ID=your_guild_id
   ```
4. Run `npm start`

## Commands

| Command | Description |
|---------|-------------|
| `/play <url or search>` | Play a YouTube video, playlist, or search for a song |
| `/skip` | Skip the current song |
| `/stop` | Stop playback and disconnect from voice |
| `/list` | Show the first 5 songs in the queue |
| `/loop <one/all/off>` | Set loop mode |
| `/roll <dice>` | Roll dice (e.g. `/roll 2d6+3`) |
| `/neko` | Get a random neko image |
| `/ping` | Pong! |
| `/pong` | Ping! |
| `/reboot` | Restart the bot |

## Dependencies

- [discord.js](https://discord.js.org/) - Discord API
- [@discordjs/voice](https://www.npmjs.com/package/@discordjs/voice) - Voice connections
- [@discordjs/opus](https://www.npmjs.com/package/@discordjs/opus) - Audio codec
- [play-dl](https://www.npmjs.com/package/play-dl) - YouTube streaming and search
- [booru](https://www.npmjs.com/package/booru) - Image board API
- [dotenv](https://www.npmjs.com/package/dotenv) - Environment variables
- [libsodium-wrappers](https://www.npmjs.com/package/libsodium-wrappers) - Encryption for voice
