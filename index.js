const fs = require('fs');
const ms = require('ms');
require('dotenv').config();

const { Client, Collection } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

const client = new Client({
	intents: [1, 32768, 512],
});

client.commands = new Collection();
const commandFolders = fs.readdirSync('./discord/commands');

for(const folder of commandFolders) 
{
    const folderFiles = fs.readdirSync(`./discord/commands/${folder}`).filter(file => file.endsWith('.js'));

    for(const file of folderFiles) 
    {
        const command = require(`./discord/commands/${folder}/${file}`);

        if(command.data instanceof SlashCommandBuilder) {
            client.commands.set(command.data.name, command);
        }
    }
}

// -------------------
//      BOT LOAD
// -------------------

client.once('ready', async () => {
    const commandData = client.commands.map(command => command.data.toJSON());
    await client.application.commands.set(commandData);
    console.log(`Logged in as ${client.user.tag}!`);
    console.log(`${commandData.length} registered commands.`);
});

// -------------------
//    BOT COMMANDS
// -------------------

client.on('interactionCreate', async interaction => 
{
    if(!interaction.isCommand()) return;
    if(!interaction.guild) return;

    const command = client.commands.get(interaction.commandName);

    if(!command) return;
    await command.execute(interaction).catch(console.error);
});

client.login(process.env.tokendiscord);
