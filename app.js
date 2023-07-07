require('dotenv').config();

const { Client, Events, GatewayIntentBits } = require('discord.js');
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('database');

// db init
db.run('CREATE TABLE IF NOT EXISTS DB (user_id TEXT UNIQUE, count NUMBER)');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]});
const token = process.env.TOKEN;

const bad_words = ['nigger', 'nigga', 'nigro'];

function checkNWord(msg) {
    var count = 0;
    msg = msg.replace(/ /g, '').toLowerCase();

    // for (let i = 0; i < bad_words.length; i++) {
    //     if (msg.toLowerCase().includes(bad_words[i]))
        
    //     count += (msg.match(/${bad_words[i]}/g) || []).length;
    // }

    bad_words.forEach(word => {
        var re = new RegExp(word, 'g');
        count += (msg.match(re) || []).length;
    });

    const flag = count > 0;

    return {flag, count};
}

client.once('ready', (client) => {
    console.log(`Logged Into: ${client.user.username}`);
});

client.on('messageCreate', (message) => {
    let content = message.content;

    if (content.toLowerCase().startsWith('>ncount'))
    {
        const user_id = message.mentions.users.first() ? message.mentions.users.first().id : message.author.id;

        db.get(`SELECT * FROM DB WHERE user_id='${user_id}'`, (err, row) => {
            if (row != undefined) {
                // row.count
                message.reply(`<@${user_id}> have used the n-word ${row.count} times`);
            } else {
                message.reply(`<@${user_id}> have used the n-word 0 times`);
            }
        });
    } else if (message.mentions.users.first()) {
        if (message.mentions.users.first().id == client.user.id) return message.reply(`\`>ncount {user}\` - Returns the amount of times a user has used the n-word or any variation of it. ({user} is optional)`);
    }
    
    var {flag, count} = checkNWord(content)

    if (flag) {
        const user_id = message.author.id;

        db.get(`SELECT * FROM DB WHERE user_id='${user_id}'`, (err, row) => {
            if (row != undefined) {
                count = parseInt(row.count) + count;
                db.run(`UPDATE DB SET count=${count} WHERE user_id='${user_id}'`)
            } else {
                db.run(`INSERT INTO DB (user_id, count) VALUES ('${user_id}', ${count})`)
            }
        });
    }
});

client.login(token);