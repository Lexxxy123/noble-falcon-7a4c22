const { makeCard } = require('./drawhit.js');
const fs = require('fs');
const path = require('path');
const { AttachmentBuilder } = require('discord.js');
const https = require('https');
const crypto = require('crypto');

async function generateAndSendImage(acc, interaction) {
    try {
        // Only generate image if account has Minecraft
        if (!acc.newName || acc.newName === "No Minecraft!") {
            console.log('[IMAGE_HANDLER] Account has no Minecraft, skipping image generation');
            return;
        }

        console.log(`[IMAGE_HANDLER] Generating image for ${acc.newName}`);
        
        // Prepare stats data for image generation
        const stats = {
            username: acc.newName,
            networth: acc.networth || "Unknown",
            bedwars: acc.bedwarsLevel || "0",
            networkLevel: acc.networkLevel || "1",
            sbLevel: acc.sbLevel || "0", 
            duelKDR: acc.duelKDR || "0",
            duelWinstreak: acc.duelWinstreak || "0",
            plusColour: acc.plusColour || "None",
            gifted: acc.gifted || "0"
        };

        // Generate image
        const outputPath = path.join(__dirname, 'temp', `${acc.newName}_stats.png`);
        
        // Create temp directory if it doesn't exist
        const tempDir = path.dirname(outputPath);
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const buffer = await makeCard(stats, outputPath);
        
        // Create Discord attachment
        const attachment = new AttachmentBuilder(buffer, { name: `${acc.newName}_stats.png` });
        
        // Send the image
        await interaction.user.send({
            content: `🎮 **Minecraft Account Stats for ${acc.newName}**`,
            files: [attachment]
        });
        
        console.log(`[IMAGE_HANDLER] Successfully sent image for ${acc.newName}`);
        
        // Clean up temp file
        if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
        }
        
    } catch (error) {
        console.error('[IMAGE_HANDLER] Error generating/sending image:', error);
    }
}

async function getSkinAttachment(username, hideUsername = false) {
    try {
        console.log(`[IMAGE_HANDLER] Generating skin attachment for ${hideUsername ? 'HIDDEN' : username}`);
        const randomId = crypto.randomBytes(8).toString('hex');
        const filename = `${randomId}.png`;
        const tempPath = path.join(__dirname, '../temp/skins', filename);

        // Create temp directory if it doesn't exist
        const tempDir = path.dirname(tempPath);
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // Download the image from visage
        const imageUrl = `https://visage.surgeplay.com/bust/${username}.png?y=-40&quality=lossless`;
        
        await new Promise((resolve, reject) => {
            https.get(imageUrl, (response) => {
                if (response.statusCode !== 200) {
                    reject(new Error(`Failed to download image: ${response.statusCode}`));
                    return;
                }

                const fileStream = fs.createWriteStream(tempPath);
                response.pipe(fileStream);

                fileStream.on('finish', () => {
                    fileStream.close();
                    resolve();
                });

                fileStream.on('error', reject);
            }).on('error', reject);
        });

        // Create attachment
        const attachment = new AttachmentBuilder(tempPath);
        console.log(`[IMAGE_HANDLER] Successfully created skin attachment with ID: ${randomId}`);

        // Clean up the file after 1 minute
        setTimeout(() => {
            fs.unlink(tempPath, (err) => {
                if (err) {
                    console.error('[IMAGE_HANDLER] Error deleting temp skin file:', err);
                } else {
                    console.log(`[IMAGE_HANDLER] Cleaned up temp skin file: ${randomId}`);
                }
            });
        }, 60000);

        return attachment;
    } catch (error) {
        console.error('Error handling skin image:', error);
        return null;
    }
}

module.exports = { generateAndSendImage, getSkinAttachment };
