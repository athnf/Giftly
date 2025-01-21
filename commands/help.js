const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Display Giftly Bot command list and information'),
    
    async execute(interaction) {
        const helpEmbed = new EmbedBuilder()
            .setColor('#FF6B6B')
            .setTitle('🎉 Giftly Bot - Command Center 🤖')
            .setDescription(`
**Welcome to Giftly Bot - Your Ultimate Giveaway Companion!** 

🌟 **Bot Features:**
• Easy Giveaway Management
• Random Winner Selection
• Flexible Duration Options
• Admin-Only Controls

💡 **Suggestions or Issues?**
Have ideas to improve the bot or found a bug? 
Feel free to DM the developer directly!
`)
            .addFields(
                { 
                    name: '🏆 /setgiveaway', 
                    value: '**Start a New Giveaway**\n`/setgiveaway [prize] [duration] [winners]`\n*Example: /setgiveaway "Discord Nitro" "1d" 2*', 
                    inline: false
                },
                { 
                    name: '🚫 /cancelgiveaway', 
                    value: '**Cancel an Active Giveaway**\nStop ongoing giveaways instantly', 
                    inline: false
                },
                { 
                    name: '❓ /help', 
                    value: '**Display Bot Commands**\nShow this helpful information panel', 
                    inline: false
                }
            )
            .setImage('https://media.discordapp.net/attachments/1110450689465778246/1253642785922662410/giveaway_banner.png?ex=6675f7f5&is=6674a675&hm=80f7be9e7c9d70dc7d5e51dd1920b22eadcd96c7c92de34d4cbfa3e9a1e2c2ca')
            .setFooter({ 
                text: 'Giftly Bot © 2025 | Developed with ❤️ by JustPrz', 
                iconURL: 'https://media.discordapp.net/attachments/1217371982333476864/1331066065920462969/Screenshot_2025-01-21_072057.jpg?ex=67904360&is=678ef1e0&hm=9d807dac562a7a4b8d978636a58f0fb6d1dfd8388df93cd257a4e8ddd63bb042&=&format=webp&width=511&height=447'
            })
            .setTimestamp();

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Invite Bot')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://discord.com/oauth2/authorize?client_id=1331056024664150127&permissions=0&integration_type=0&scope=bot'),
                new ButtonBuilder()
                    .setLabel('Support Developer')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://saweria.co/justprz'),
                new ButtonBuilder()
                    .setLabel('DM Developer')
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId('dm_developer')
            );

        const response = await interaction.reply({
            embeds: [helpEmbed],
            components: [buttons],
            ephemeral: true
        });

        // Handle DM Developer button
        const collector = response.createMessageComponentCollector({ 
            time: 60000 
        });

        collector.on('collect', async (interaction) => {
            if (interaction.customId === 'dm_developer') {
                try {
                    const owner = await interaction.client.users.fetch(process.env.OWNER_ID);
                    
                    const dmEmbed = new EmbedBuilder()
                        .setColor('#00FF00')
                        .setTitle('📨 Contact Developer')
                        .setDescription(`
**Want to reach out to the developer?**

🤖 Developer: JustPrz
📧 You can DM them directly on Discord

**Tips for Effective Communication:**
• Be clear and concise
• Provide specific details about your suggestion or issue
• Be respectful
                        `);

                    await interaction.reply({
                        embeds: [dmEmbed],
                        ephemeral: true
                    });
                } catch (error) {
                    console.error('Error fetching owner:', error);
                    await interaction.reply({
                        content: '❌ Unable to fetch developer information.',
                        ephemeral: true
                    });
                }
            }
        });
    }
};