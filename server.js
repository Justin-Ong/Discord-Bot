const fs = require("fs");
const path = require("path");

const {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  REST,
  Routes,
} = require("discord.js");

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

client.commands = new Collection();

const commandsPath = path.join(__dirname);
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

const commands = [];
for (const file of commandFiles) {
  if (file.includes("server")) {
    continue;
  }
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  // Set a new item in the Collection with the key as the command name and the value as the exported module
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
    );
  }

  commands.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(process.env.SECRET);
(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    const data = await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    console.error(error);
  }
})();

client.once(Events.ClientReady, () => {
  console.log("Ready!");
});

client.login(process.env.SECRET).then(loginSuccess, loginFailure);

client.on(Events.InteractionCreate, async (interaction) => {
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
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

function loginSuccess(result) {
  let now = Date();
  let string = "Logged in as " + client.user.username + " at " + now;
  fs.readFile("startup_log.json", function (err, data) {
    if (err) {
      throw "could not read log file due to: " + err;
    }

    startup_log.prev_success = startup_log.curr_success;
    startup_log.curr_success = string;

    fs.writeFile(
      "startup_log.json",
      JSON.stringify(startup_log, null, 2),
      function (err) {
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
  fs.readFile("startup_log.json", function (err, data) {
    if (err) {
      throw "could not read log file due to: " + err;
    }
    startup_log.prev_failure = startup_log.curr_failure;
    startup_log.curr_failure = string;

    fs.writeFile(
      "startup_log.json",
      JSON.stringify(startup_log, null, 2),
      function (err) {
        if (err) {
          return console.log(err);
        }
        console.log(string);
      }
    );
  });
}
