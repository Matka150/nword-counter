require('dotenv').config();

const { Client, Events, GatewayIntentBits, REST, Routes, SlashCommandBuilder, Collection } = require('discord.js');
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('database');

// db init
db.run('CREATE TABLE IF NOT EXISTS DB (user_id TEXT UNIQUE, count NUMBER)');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]});
const token = process.env.TOKEN;

client.commands = new Collection();

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const cmd =  {
    data: new SlashCommandBuilder()
        .setName('ncount')
        .setDescription('Sends the amount of times user has used the n-word.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to check n-word usage')
                .setRequired(false)),
        async execute(interaction) {
            const user_id = interaction.options.getUser('user') != null ? interaction.options.getUser('user').id : interaction.user.id;

            await db.get(`SELECT * FROM DB WHERE user_id='${user_id}'`, (err, row) => {
                if (row != undefined) {
                    // row.count
                    interaction.reply(`<@${user_id}> have used the n-word ${numberWithCommas(row.count)} times`);
                } else {
                    interaction.reply(`<@${user_id}> have used the n-word 0 times`);
                }
            });
        }
}

client.commands.set('ncount', cmd);



const bad_words = ['nigger', 'nigga', 'nigro'];

function checkNWord(msg) {
    var count = 0;
    msg = msg.replace(/ /g, '').toLowerCase();


    bad_words.forEach(word => {
        var re = new RegExp(word, 'g');
        count += (msg.match(re) || []).length;
    });

    const flag = count > 0;

    return {flag, count};
}

client.once('ready', (client) => {
    console.log(`Logged Into: ${client.user.username}`);

    const clientId = client.application.id;

    const rest = new REST({ version: '10' }).setToken(token);

    (async () => {
        try {
            const data = await rest.put(
                Routes.applicationCommands(clientId),
                { body: [cmd.data.toJSON()] },
            );
        } catch (error) {
            console.error(error);
        }
    })();
});

client.on('messageCreate', (message) => {
    let content = message.content;

    if (message.mentions.users.first() && message.author.id != client.user.id) {
        if (message.mentions.users.first().id == client.user.id) return message.reply(`\`/ncount {user}\` - Returns the amount of times a user has used the n-word or any variation of it. ({user} is optional)`);
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

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.login(token);