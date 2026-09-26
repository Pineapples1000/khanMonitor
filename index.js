require('dotenv').config();
const fs = require('fs');

const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

client.once('clientReady', async () => {
    let storage = JSON.parse(fs.readFileSync('storage.json', 'utf8'));
    for (let i = 0; i < storage.channels.length; i++) {
        try {
            const channel = await client.channels.fetch(storage.channels[i]);
            if (channel && channel.isTextBased()) {
                await channel.send('test');
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }
});

//message is sent
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;//if bot, return
    if (message.content.toLowerCase()[0] === '~') {
        let m = message.content.toLowerCase();
        m = m.substring(1);
        m = m.split(' ');
        switch (m[0]) {
            case 'ping':
                await message.reply('Pong!');
                break;
            case 'addchannel':
                let storage = JSON.parse(fs.readFileSync('storage.json', 'utf8'));
                storage.channels.push(message.channelId);
                for (let i = 0; i < storage.channels.length; i++) {
                    if (storage.channels[i] == "" + message.channelId) {
                        await message.reply(`This channel has already been added.`);
                        return;
                    }
                }
                let str = JSON.stringify(storage, null, 2);
                try {
                    fs.writeFileSync('storage.json', str, 'utf8');
                } catch (err) {
                    console.error('Error writing file:', err);
                }
                await message.reply(`Channel with ID ${message.channelId} has been added.`);
                break;
            case 'removechannel':
                let storage2 = JSON.parse(fs.readFileSync('storage.json', 'utf8'));
                let channelExists = false;
                for (let i = 0; i < storage2.channels.length; i++) {
                    if (storage2.channels[i] == "" + message.channelId) {
                        channelExists = true;
                        storage2.channels.splice(i, 1);
                        i--;
                    }
                }
                let str2 = JSON.stringify(storage2, null, 2);
                try {
                    fs.writeFileSync('storage.json', str2, 'utf8');
                } catch (err) {
                    console.error('Error writing file:', err);
                }
                await message.reply(channelExists ? `Channel with ID ${message.channelId} has been removed.` : `This channel has not been added yet.`);
                break;
        }
    }
});


//login
client.login(process.env.TOKEN);