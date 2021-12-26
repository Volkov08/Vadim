const fs = require('fs');
const Discord = require('discord.js');

const BOT_TOKEN = JSON.parse(fs.readFileSync('tokens.json')).bot

const client = new Discord.Client({
	partials: ['USER', 'GUILD_MEMBER', 'MESSAGE', 'CHANNEL', 'REACTION'],
	intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS']
})
var stg = JSON.parse(fs.readFileSync('settings.json'));
const shortComp = (m, l, s) => {
	return m.trim() == stg.prefix + l || m.trim() == stg.prefix + s
}

const WELCOME_CHANNEL = '922934040611405844'
const SERVER_ID = '830870811816099941'
const IMAGE_URL = 'https://media.discordapp.net/attachments/815916673961426994/921741709421969450/RickAstley2021.jpeg?width=1392&height=884'
const WELCOME_COLORS = [0xff0000, 0xff9100, 0xfbff00, 0x00ff37, 0x00ffd5, 0x0073ff, 0x8000ff, 0xff0084]

client.once('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`)
	client.user.setActivity('ur mom', {
		type: 'PLAYING'
	})
	setInterval(changeActivity, 4000)
})

client.on('guildMemberAdd', member => {
	if (member.guild.id != SERVER_ID) return
	member.guild.channels.fetch(WELCOME_CHANNEL).then(c => {
		c.send({
			content: `${member}`,
			embeds: [{
				title: `Willkommen ${member.displayName}!`,
				description: `Willkommen bei ${member.guild.name}`,
				color: WELCOME_COLORS[Math.floor(Math.random() * WELCOME_COLORS.length)],
				thumbnail: {
					url: member.displayAvatarURL({
						format: 'png',
						size: 512
					})
				},
				image: {
					url: IMAGE_URL
				}
			}]
		})
	});
});

client.on('messageCreate', msg => {
	if (msg.author.bot) return
	console.log(msg)
	//commands
	//ping
	if (shortComp(msg.content, 'ping', 'p')) {
		let ping = Date.now() - msg.createdAt
		msg.channel.send({
			embeds: [{
				color: ping > 800 ? 0xff000 : (ping > 200 ? 0xffea00 : 0x00ff6e),
				description: `Ping: ${ping}ms`
			}]
		})

		//help
	} else if (shortComp(msg.content, 'help', 'h')) {
		msg.channel.send({
			embeds: [{
				title: 'Befehle:',
				color: 0x00ff6e,
				thumbnail: {
					url: IMAGE_URL
				},
				description: '*`Befehl #Zahl <Text> @User (optional)` `Kurzform von Befehl`*\n',
				fields: [{
						name: 'Moderation',
						value: `\`${stg.prefix}purge #Nachrichten\` \`${stg.prefix}prg\` löscht \`#Nachrichten\` Nachrichten\n` +
							`\`${stg.prefix}ban @User (<Grund>) \` bannt \`@User\` mit dem Grund \`<Grund>\`\n` +
							`\`${stg.prefix}kick @User (<Grund>) \` kick \`@User\` mit dem Grund \`<Grund>\`\n`
					},
					{
						name: 'Sonstige',
						value: `\`${stg.prefix}ping\` \`${stg.prefix}p\` zeigt den Ping Discord -> Bot an\n` +
							`\`${stg.prefix}help\` \`${stg.prefix}h\` zeigt diese Nachricht an\n`
					}
				]
			}]
		})

		//purge
	} else if (shortComp(msg.content.split(" ")[0], 'purge', 'prg')) {
		let amount = parseInt(msg.content.split(" ")[1])
		if (!amount) return
		if (amount > 100) {
			msg.channel.send({
				embeds: [{
					color: 0xff0000,
					description: 'Befel gescheitert:\nkann maximal 100 Nachrichten löschen'
				}]
			})
		} else if (!msg.member.permissions.has('MANAGE_MESSAGES')) {
			msg.channel.send({
				embeds: [{
					color: 0xff0000,
					description: 'Befehl gescheitert: fehlende Berechtigung:\n`MANAGE_MESSAGES`'
				}]
			})
		} else {
			msg.channel.bulkDelete(amount + 1, {
				filterOld: true
			})
			msg.channel.send({
				embeds: [{
					color: 0x00ff6e,
					fields: [{
						name: `${amount} Nachricht${amount>1?'en':''} gelöscht`,
						value: `*Befehl ausgeführt von ${msg.author}*`
					}]
				}]
			})
		}

		//ban
	} else if (msg.content.split(" ")[0] == stg.prefix + 'ban' && msg.mentions.members.size == 1) {
		let member = msg.mentions.members.first()
		let reason = msg.content.substring(msg.content.indexOf(">") + 2)
		if (member.id == msg.member.id) {
			msg.channel.send({
				embeds: [{
					color: 0xff0000,
					description: 'Befel gescheitert:\ndu kannst dich nicht selbst bannen'
				}]
			})
		} else if (!msg.member.permissions.has('BAN_MEMBERS')) {
			msg.channel.send({
				embeds: [{
					color: 0xff0000,
					description: 'Befehl gescheitert: fehlende Berechtigung:\n`BAN_MEMBERS`'
				}]
			})
		} else if (member.permissions.has('BAN_MEMBERS')) {
			msg.channel.send({
				embeds: [{
					color: 0xff0000,
					description: `Befehl gescheitert: du kannst ${member} nicht bannen`
				}]
			})
		} else {
			//neue nachricht auch löschen
			msg.channel.send({
				embeds: [{
					color: 0x00ff6e,
					fields: [{
						name: `Befehl erfolgreich!`,
						value: `**${member} wurde gebannt!**\n${reason?`Grund: ${reason}\n`:''}*Befehl ausgeführt von ${msg.author}*`
					}]
				}]
			})
			member.send({
				embeds: [{
					color: 0xff0000,
					fields: [{
						name: `Du wurdest von ${member.guild.name} gebannt!`,
						value: `${reason?`Grund: ${reason}\n`:'kein Grund angegeben'}`
					}]
				}]
			}).catch(console.error).then(() => {
				member.ban({
					reason: reason
				})
			})
		}

		//kick
	} else if (msg.content.split(" ")[0] == stg.prefix + 'kick' && msg.mentions.members.size == 1) {
		let member = msg.mentions.members.first()
		let reason = msg.content.substring(msg.content.indexOf(">") + 2)
		if (member.id == msg.member.id) {
			msg.channel.send({
				embeds: [{
					color: 0xff0000,
					description: 'Befel gescheitert:\ndu kannst dich nicht selbst kicken'
				}]
			})
		} else if (!msg.member.permissions.has('KICK_MEMBERS')) {
			msg.channel.send({
				embeds: [{
					color: 0xff0000,
					description: 'Befehl gescheitert: fehlende Berechtigung:\n`KICK_MEMBERS`'
				}]
			})
		} else if (member.permissions.has('KICK_MEMBERS')) {
			msg.channel.send({
				embeds: [{
					color: 0xff0000,
					description: `Befehl gescheitert: du kannst ${member} nicht kicken`
				}]
			})
		} else {
			msg.channel.send({
				embeds: [{
					color: 0x00ff6e,
					fields: [{
						name: `Befehl erfolgreich!`,
						value: `**${member} wurde gekickt!**\n${reason?`Grund: ${reason}\n`:''}*Befehl ausgeführt von ${msg.author}*`
					}]
				}]
			})
			member.send({
				embeds: [{
					color: 0xffea00,
					fields: [{
						name: `Du wurdest von ${member.guild.name} gekickt!`,
						value: `${reason?`Grund: ${reason}\n`:'kein Grund angegeben'}`
					}]
				}]
			}).catch(console.error).then(() => {
				member.kick({
					reason: reason
				})
			})
		}
		//list bans
	} else if (shortComp(msg.content, 'listbans', 'lb')) {
		msg.guild.bans.fetch().then((b) => {
			const row = b.size>8?new Discord.MessageActionRow().addComponents([
				new Discord.MessageButton({
					label: '<<',
					style: 'SUCCESS',
					customId: '<<'
				}),
				new Discord.MessageButton({
					label: '<',
					style: 'PRIMARY',
					customId: '<'
				}),
				new Discord.MessageButton({
					label: '>',
					style: 'PRIMARY',
					customId: '>'
				}),
				new Discord.MessageButton({
					label: '>>',
					style: 'SUCCESS',
					customId: '>>'
				})
			]):{};
			// ^ if bans is short, don't create the object but {} instead
			msg.channel.send({
				embeds: [genBansEmbed(0, b, 1)],
				//passing {} will cause error
				components: b.size>8?[row]:undefined
			}).then(b.size>8?(rsp) => {
				let page = 0
				const queueNavFilter = (i) => {
					return ['<<', '<', '>', '>>'].includes(i.customId) && i.user.id === msg.author.id && i.message.id === rsp.id
				};
				const collector = rsp.channel.createMessageComponentCollector({
					filter: queueNavFilter,
					time: 60000
				});

				collector.on('collect', async i => {
					switch (i.customId) {
						case '<<':
							page = 0
							break;
						case '<':
							page = Math.max(page - 1, 0)
							break;
						case '>':
							page = Math.min(page + 1, Math.max(Math.ceil(b.size/8) - 1, 0))
							break;
						case '>>':
							page = Math.max(Math.ceil(b.size/8) - 1, 0)
					}
					i.update({
						embeds: [genBansEmbed(page,b)]
					})
				});

				collector.on('end', () => {
					rsp.edit({
						row: []
					})
				});

			}:()=>{})
		})
	}
})

function genBansEmbed(page, bans) {
	let i = 0
	let e = {
		color: 0x00ff6e,
		title: 'Liste aller gebannten User',
		footer: {
			text: `insgesamt: ${bans.size} • Seite ${page+1}/${Math.ceil(bans.size/8)}`
		},
		fields: []
	}
	for (const b of bans.values()) {
		if (i >= page * 8 && i < (page + 1) * 8) {
			e.fields.push({
				name: b.user.tag,
				value: (b.reason ? `Grund: ${b.reason}` : 'kein Grund angegeben')
			})
		}
		i++
	}
	return e
}

var a = false;
const splashes = ["ur mom", "sqrt(-1) am cool!", "6 ist perfekt!", "warum hat das Hünchen die straße überquert?", "12345678910987654321 ist eine Primzahl!"]

function changeActivity() {
	if (a) {
		client.user.setActivity(`prefix: ${stg.prefix}`, {
			type: 'PLAYING'
		})
	} else {
		client.user.setActivity(splashes[Math.floor(Math.random() * splashes.length)], {
			type: 'PLAYING'
		})
	}
	a = !a
}

client.login(BOT_TOKEN)
