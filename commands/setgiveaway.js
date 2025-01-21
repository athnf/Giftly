const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setgiveaway')
        .setDescription('Start a giveaway')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
        .addStringOption(option => 
            option.setName('prize')
                .setDescription('Prize for giveaway')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('duration')
                .setDescription('Giveaway duration (e.g., 1h, 1d)')
                .setRequired(true)
        )
        .addIntegerOption(option => 
            option.setName('winners')
                .setDescription('Number of winners')
                .setMinValue(1)
                .setMaxValue(10)
        ),
    
    async execute(interaction, client, giveaways, activeGiveaways) {
        // Cek apakah sudah ada giveaway aktif di server
        if (activeGiveaways.has(interaction.guildId)) {
            return interaction.reply({
                content: "❌ Sudah ada giveaway aktif di server ini! Batalkan terlebih dahulu.",
                ephemeral: true
            });
        }

        const prize = interaction.options.getString('prize');
        const duration = interaction.options.getString('duration');
        const winners = interaction.options.getInteger('winners') || 1;

        // Validasi durasi
        if (!['s', 'm', 'h', 'd', 'w'].some(unit => duration.endsWith(unit))) {
            return interaction.reply({
                content: "❌ Format durasi salah! Gunakan contoh: 1h, 2d, 30m",
                ephemeral: true
            });
        }

        const endTime = Date.now() + ms(duration);

        const giveawayEmbed = new EmbedBuilder()
            .setTitle('🎉 GIFTLY GIVEAWAY 🎉')
            .setDescription(`**Prize:** ${prize}\n**Winners:** ${winners}\n**Hosted By:** ${interaction.user}\n**Ends:** <t:${Math.floor(endTime / 1000)}:R>`)
            .setColor('#FF6B6B')
            .setFooter({ text: 'React 🎉 to enter!' });

        try {
            const message = await interaction.channel.send({ embeds: [giveawayEmbed] });
            await message.react('🎉');

            const giveawayData = {
                prize,
                winners,
                endTime,
                guildId: interaction.guildId,
                channelId: interaction.channelId,
                messageId: message.id,
                host: interaction.user.id,
                participants: new Set()
            };

            giveaways.set(message.id, giveawayData);
            activeGiveaways.set(interaction.guildId, giveawayData);

            setTimeout(async () => {
                const giveaway = giveaways.get(message.id);
                if (!giveaway) return;

                const channel = client.channels.cache.get(giveaway.channelId);
                const msg = await channel.messages.fetch(message.id);

                const participants = Array.from(giveaway.participants);
                
                if (participants.length < giveaway.winners) {
                    const endEmbed = new EmbedBuilder()
                        .setTitle('🎉 Giveaway Ended 🎉')
                        .setDescription(`**Prize:** ${giveaway.prize}\n**Status:** Not enough participants`)
                        .setColor('Red');
                    
                    await msg.edit({ embeds: [endEmbed] });
                    
                    giveaways.delete(message.id);
                    activeGiveaways.delete(giveaway.guildId);
                    return;
                }

                const winnerUsers = participants
                    .sort(() => 0.5 - Math.random())
                    .slice(0, giveaway.winners);

                const endEmbed = new EmbedBuilder()
                    .setTitle('🎉 Giveaway Ended! 🎉')
                    .setDescription(`**Prize:** ${giveaway.prize}\n**Winners:** ${winnerUsers.map(u => `<@${u}>`).join(', ')}`)
                    .setColor('Green')
                    .setFooter({ text: `Hosted by ${interaction.user.username}` });

                await msg.edit({ embeds: [endEmbed] });
                
                giveaways.delete(message.id);
                activeGiveaways.delete(giveaway.guildId);
            }, ms(duration));

            await interaction.reply({ 
                content: '🎉 Giveaway dimulai!', 
                ephemeral: true 
            });
        } catch (error) {
            console.error('Giveaway creation error:', error);
            await interaction.reply({
                content: "❌ Gagal membuat giveaway. Pastikan bot memiliki izin yang cukup.",
                ephemeral: true
            });
        }
    }
};