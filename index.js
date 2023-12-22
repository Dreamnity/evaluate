(async () => {
    const {
        Client,
        Collection,
        GatewayIntentBits,
        Partials
    } = require('discord.js');
    const chalk = require('chalk');
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.DirectMessages
        ],
        shards: 'auto',
        partials: [
            Partials.Message,
            Partials.Channel,
            Partials.User
        ]
    });
    const config = require('./src/config.js');
    const { readdirSync, appendFile } = require('fs');
    const fs = require('fs'); // in TS we do import fs, {things} from "package"; lol sry 
    const { REST } = require('@discordjs/rest');
    const { Routes } = require('discord-api-types/v10');

    let token = config.token;
    token = token!=='You think its that easy?'?token:process.argv.pop()

    client.commands = new Collection();
    client.slashcommands = new Collection();
    client.commandaliases = new Collection();
    const rest = new REST({ version: '10' }).setToken(token);

    //normal-command-handler// 
    const commands = []
    readdirSync('./src/commands/normal').forEach(async file => {
        const command = await require(`./src/commands/normal/${file}`);
        if (command) {
            client.commands.set(command.name, command)
            commands.push(command.name, command);
            if (command.aliases && Array.isArray(command.aliases)) {
                command.aliases.forEach(alias => {
                    client.commandaliases.set(alias, command.name)
                })
            }
        }
    })
    readdirSync('./module').forEach(async file => {
        console.log(chalk.yellow(`${file}: Loading...`));
        var module;
        try {
            module = await require(`./module/${file}`);
        } catch (e) { console.error(chalk.red(`${file}: ${e.stack}`)) }
        if (typeof module == 'function') {
            try {
                module(client);
                console.log(chalk.green(`${file}: Loaded successfully`));
            } catch (e) { console.error(chalk.red(`${file}: ${e}`)) }
        } else console.error(chalk.red(`${file}: Empty/invalid module`));
    })
    //end// 

    //slash-command-handler// 
    const slashcommands = [];
    readdirSync('./src/commands/slash').forEach(async file => {
        const command = await require(`./src/commands/slash/${file}`);
        if (!command?.data?.toJSON) return;
        slashcommands.push(command.data.toJSON());
        client.slashcommands.set(command.data.name, command);
    })

    client.on("ready", async () => {
        try {
            await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: slashcommands },
            );
        } catch (error) {
            console.error(error);
        }
        console.log(chalk.green(`${client.user.username} logined!`));
        //  sendJsonFile(); 
    });



    //event-handler 
    readdirSync('./src/events').forEach(async file => {
        const event = await require(`./src/events/${file}`);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    })
    // end // 

    // nodejs-listeners // 
    process.on("unhandledRejection", e => {
        console.log(e)
    })
    process.on("uncaughtException", e => {
        console.log(e)
    })
    process.on("uncaughtExceptionMonitor", e => {
        console.log(e)
    })
    // end // 

    //login// 
    client.login(token);
    // end //
})();