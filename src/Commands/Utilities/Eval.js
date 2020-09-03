const Command = require('../../Structures/Command.js');
const { MessageAttachment } = require('discord.js');
const { Type } = require('@extreme_hero/deeptype');
const { inspect } = require('util');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['ev'],
			description: 'Evals a chunk of Code.',
            category: 'Developer',
            ownerOnly: true
		});
	}

	async run(message, args) {
		// this will enable to use !ev msg.guild too
		const msg = message;
		if (!args.length) return msg.channel.send(`I need a code to eval!`);
		let code = args.join(' ');
		// Adding support for ios device while during eval
		code = code.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
		let evaled;
		try {
			const start = process.hrtime();
			evaled = eval(code);
			if (evaled instanceof Promise) {
				evaled = await evaled;
			}
			const stop = process.hrtime(start);
			const response = [
				`**Output:** \`\`\`js\n${this.clean(inspect(evaled, { depth: 0 }))}\n\`\`\``,
				`**Type:** \`\`\`ts\n${new Type(evaled).toString()}\n\`\`\``,
				`**Time Taken:** \`\`\`${(((stop[0] * 1e9) + stop[1])) / 1e6}ms\`\`\``
			]
			const res = response.join('\n')
			if (res.length < 2000) {
				await msg.channel.send(res);
			} else {
				const output = new MessageAttachment(Buffer.from(res), "output.txt")
				await msg.channel.send(output)
			}
		} catch (err) {
			return message.channel.send(`Error:\`\`\`xl\n${this.clean(err)}\n\`\`\``);
		}
	}

	clean(text) {
		if (typeof text === 'string') {
			text = text
			.replace(/`/g, `\`${String.fromCharCode(8203)}`).replace(/@/g, `@${String.fromCharCode(8203)}`)
			.replace(new RegExp(this.client.token, 'gi'), '****');
		}
		return text;
	}

};
