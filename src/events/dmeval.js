module.exports = {
    name: 'messageCreate',
    execute: async (msg) => {
        if(msg.channel.type !== 'dm') return;
        msg.client.commands.get('eval').run(msg.client,msg,msg.content);
    }
}