const Event = require('../../Structures/Event');

module.exports = class extends Event {

	async run(message) {
		const mentionRegex = RegExp(`^<@!${this.client.user.id}>$`);
		const mentionRegexPrefix = RegExp(`^<@!${this.client.user.id}> `);

		if (message.author.bot) return;

		if (message.content.match(mentionRegex)) message.channel.send(`My prefix for ${message.guild.name} is \`${this.client.prefix}\`.`);

		const prefix = message.content.match(mentionRegexPrefix) ?
			message.content.match(mentionRegexPrefix)[0] : this.client.prefix;

		const [cmd, ...args] = message.content.slice(prefix.length).trim().split(/ +/g);

		const command = this.client.commands.get(cmd.toLowerCase()) || this.client.commands.get(this.client.aliases.get(cmd.toLowerCase()));
		if (command) {

			if (command.ownerOnly && !this.client.owners.includes(message.author.id)) {
				return message.reply(`Sorry, this command can only be used by the bot owners.`);
			}

			if (command.guildOnly && !message.guild) {
				return message.reply(`This command can only be used in a discord server.`);
			}

			if (command.nsfw && !message.channel.nsfw) {
				return message.reply(`This command can only be ran in a NSFW marked channel.`);
			}

			if (command.userPerms) {
				const missing = message.channel.permissionsFor(message.member).missing(command.userPerms);
				if (missing.length) {
					return message.reply(`You are missing ${this.client.utils.formatArray(missing.map(this.client.utils.formatPerms))} permissions, you need them to use this command!`);
				}
			}

			if (command.botPerms) {
				const missing = message.channel.permissionsFor(this.client.user).missing(command.userPerms);
				if (missing.length) {
					return message.channel.send(`I am missing ${this.client.utils.formatArray(missing.map(this.client.utils.formatPerms))} permissions, I need them to run this command!`);
				}
			}

			command.run(message, args);
		}
	}

};