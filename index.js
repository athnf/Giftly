require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { 
  Client, 
  GatewayIntentBits, 
  Collection, 
  REST, 
  Routes, 
  ActivityType 
} = require('discord.js');

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ] 
});

const giveaways = new Map();
const activeGiveaways = new Map();
client.commands = new Collection();

// Load commands
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

client.on('ready', async () => {
    console.log(`🚀 ${client.user.tag} is online!`);
    console.log(`🌐 Serving ${client.guilds.cache.size} servers`);
    
    // Set Bot Status
    client.user.setPresence({
        activities: [{ 
            name: 'Giveaway | /help', 
            type: ActivityType.Listening 
        }],
        status: 'online'
    });
    
    // Deploy commands
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    try {
        console.log('🔄 Refreshing application (/) commands...');

        const commands = [];
        for (const file of commandFiles) {
            const command = require(`./commands/${file}`);
            commands.push(command.data.toJSON());
        }

        // Global deployment
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );

        console.log('✅ Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('❌ Command deployment error:', error);
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (command) {
        try {
            await command.execute(interaction, client, giveaways, activeGiveaways);
        } catch (error) {
            console.error('Command Execution Error:', error);
            await interaction.reply({
                content: '❌ Terjadi kesalahan saat menjalankan perintah!',
                ephemeral: true
            });
        }
    }
});

client.on('messageReactionAdd', (reaction, user) => {
    if (user.bot) return;
    const message = reaction.message;
    
    if (giveaways.has(message.id) && reaction.emoji.name === '🎉') {
        const giveaway = giveaways.get(message.id);
        giveaway.participants.add(user.id);
    }
});

// Enhanced Error Handling
client.on('error', (error) => {
    console.error('Discord Client Error:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Graceful Shutdown
process.on('SIGINT', () => {
    console.log('🛑 Shutting down gracefully...');
    client.destroy();
    process.exit(0);
});

client.login(process.env.TOKEN);