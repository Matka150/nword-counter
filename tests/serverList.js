const {Client, GatewayIntentBits} = require('discord.js');

require('dotenv').config();

const client = new Client({intents: [GatewayIntentBits.Guilds]});

client.once('ready', client => console.log(client.guilds.cache));

client.login(process.env.token);
