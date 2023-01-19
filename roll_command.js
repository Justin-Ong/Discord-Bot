const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pong')
		.setDescription('Replies with Ping!'),
	async execute(interaction) {
		await interaction.reply('Ping!');
	},
};

function diceRoller(msg) {
        let input = msg.content.slice(5).toLowerCase();
        input = input.replace(/\s/g, ""); //remove any whitespace

        if (input.match(/([a-ce-z])|(d{2,})|([!@#$%^&*()_\=\[\]{};':"\\|,.<>\/?])/g)) {
            return msg.reply("Invalid Input!");
        }

        let values = input.match(/(\d+d\d+)|(\d+)/g);
        input = input.split(/(\d+d\d+)|(\d+)/g).join("");
        let operators = input.match(/[\+\-]/g);
        if (operators != null) {
            operators.unshift("+");
        }
      
        if (values === null) {
            return msg.reply("Invalid Input!");
        }

        let sum = 0;
        let tempResults = [];
        let result = [];
        let opIndex = 0;
        for (let i = 0; i < values.length; i++) {
            if ((values[i]) % 1 === 0) {
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

        let ans = "[" + result.join(", ") + "], Total Sum is: " + sum;

        if (ans.length > 2000) {
            //stay within 2000 character limit
            return msg.reply("Too many dice to display, Total Sum is: " + sum);
        }
        return msg.reply(ans);
    }
