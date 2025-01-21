const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cancelgiveaway')
        .setDescription('Cancel active giveaway')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),
    
    async execute(interaction, client, giveaways, activeGiveaways) {
        const guildId = interaction.guildId;
        
        // Cek apakah ada giveaway aktif di server
        if (!activeGiveaways.has(guildId)) {
            return interaction.reply({
                content: "❌ Tidak ada giveaway aktif di server ini!",
                ephemeral: true
            });
        }

        const activeGiveaway = activeGiveaways.get(guildId);
        
        try {
            const channel = client.channels.cache.get(activeGiveaway.channelId);
            const message = await channel.messages.fetch(activeGiveaway.messageId);

            const cancelEmbed = new EmbedBuilder()
                .setTitle('🚫 Giveaway Dibatalkan 🚫')
                .setDescription(`**Prize:** ${activeGiveaway.prize}\n**Status:** Dibatalkan oleh admin`)
                .setColor('Red');

            await message.edit({ embeds: [cancelEmbed] });
            
            // Hapus giveaway dari memori
            giveaways.delete(activeGiveaway.messageId);
            activeGiveaways.delete(guildId);

            await interaction.reply({
                content: "✅ Giveaway berhasil dibatalkan!",
                ephemeral: true
            });
        } catch (error) {
            console.error('Cancel giveaway error:', error);
            await interaction.reply({
                content: "❌ Gagal membatalkan giveaway.",
                ephemeral: true
            });
        }
    }
};