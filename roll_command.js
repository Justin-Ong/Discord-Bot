const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roll")
    .setDescription("Rolls dice")
    .addStringOption((option) =>
      option.setName("input").setDescription("The dice input").setRequired(true)
    ),
  async execute(interaction) {
    const input = interaction.options.getString("input");
    await interaction.deferReply();
    await diceRoller(interaction, input);
  },
};

function diceRoller(interaction, msg) {
  let input = msg.toLowerCase();
  input = input.replace(/\s/g, ""); //remove any whitespace

  if (
    input.match(/([a-ce-z])|(d{2,})|([!@#$%^&*()_\=\[\]{};':"\\|,.<>\/?])/g)
  ) {
    interaction.editReply("Invalid Input!");
  }

  let values = input.match(/(\d+d\d+)|(\d+)/g);
  input = input.split(/(\d+d\d+)|(\d+)/g).join("");
  let operators = input.match(/[\+\-]/g);
  if (operators != null) {
    operators.unshift("+");
  }

  if (values === null) {
    interaction.editReply("Invalid Input!");
  }

  let sum = 0;
  let tempResults = [];
  let result = [];
  let opIndex = 0;
  for (let i = 0; i < values.length; i++) {
    if (values[i] % 1 === 0) {
      if (operators != null && operators[opIndex] == "-") {
        values[i] *= -1;
      }
      sum += values[i] / 1;
      tempResults.push(values[i]);
    } else {
      for (let j = 0; j < values[i].split("d")[0] / 1; j++) {
        let randomValue = 0;
        if (values[i].split("d")[1] != "0") {
          randomValue = Math.floor(Math.random() * values[i].split("d")[1]) + 1;
          if (operators != null && operators[opIndex] == "-") {
            randomValue *= -1;
          }
        }
        sum += randomValue;
        tempResults.push(randomValue);
      }
    }
    opIndex++;
    result.push("[" + tempResults.join(", ") + "]");
    tempResults = [];
  }

  let ans = "Rolled " + input + ": [" + result.join(", ") + "], Total Sum is: " + sum;

  if (ans.length > 2000) {
    //stay within 2000 character limit
    interaction.editReply("Too many dice to display, Total Sum is: " + sum);
  }
  interaction.editReply(ans);
}
