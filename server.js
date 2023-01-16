const fs = require("fs");
const path = require('path');

const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');

const startup_log = require("./startup_log.json");

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildEmojisAndStickers,
	],
});

client.once(Events.ClientReady, () => {
	console.log('Ready!');
});

client.login(process.env.SECRET).then(loginSuccess, loginFailure);

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

function loginSuccess(result) {
    let now = Date();
    let string = "Logged in as " + client.user.username + " at " + now;
    fs.readFile("startup_log.json", function(err, data) {
        if (err) {
            throw "could not read log file due to: " + err;
        }

        startup_log.prev_success = startup_log.curr_success;
        startup_log.curr_success = string;

        fs.writeFile(
            "startup_log.json",
            JSON.stringify(startup_log, null, 2),
            function(err) {
                if (err) {
                    return console.log(err);
                }
                console.log(string);
            }
        );
    });
}

function loginFailure(error) {
    let now = Date();
    let string = "Failed to log in at " + now + " due to: " + error;
    fs.readFile("startup_log.json", function(err, data) {
        if (err) {
            throw "could not read log file due to: " + err;
        }
        startup_log.prev_failure = startup_log.curr_failure;
        startup_log.curr_failure = string;

        fs.writeFile(
            "startup_log.json",
            JSON.stringify(startup_log, null, 2),
            function(err) {
                if (err) {
                    return console.log(err);
                }
                console.log(string);
            }
        );
    });
}