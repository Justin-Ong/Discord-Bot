require("dotenv").config();
const fs = require("fs/promises");
const fsSync = require("fs");
const path = require("path");

const {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  REST,
  Routes,
} = require("discord.js");

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

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fsSync
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

const commands = [];
for (const file of commandFiles) {
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

const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);
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

client.login(process.env.BOT_TOKEN).then(loginSuccess, loginFailure);

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

async function loginSuccess() {
  const now = new Date().toISOString();
  const string = "Logged in as " + client.user.username + " at " + now;
  try {
    const data = await fs.readFile("startup_log.json", "utf8");
    const log = JSON.parse(data);
    log.prev_success = log.curr_success;
    log.curr_success = string;
    await fs.writeFile("startup_log.json", JSON.stringify(log, null, 2));
    console.log(string);
  } catch (err) {
    console.error("Could not update log file:", err.message);
  }
}

async function loginFailure(error) {
  const now = new Date().toISOString();
  const string = "Failed to log in at " + now + " due to: " + error;
  try {
    const data = await fs.readFile("startup_log.json", "utf8");
    const log = JSON.parse(data);
    log.prev_failure = log.curr_failure;
    log.curr_failure = string;
    await fs.writeFile("startup_log.json", JSON.stringify(log, null, 2));
    console.log(string);
  } catch (err) {
    console.error("Could not update log file:", err.message);
  }
}

module.exports = { client };
