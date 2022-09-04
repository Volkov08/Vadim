const fs = require('fs');
const Discord = require('discord.js');

const BOT_TOKEN = JSON.parse(fs.readFileSync('tokens.json')).bot

var stg = JSON.parse(fs.readFileSync('settings.json'));
const shortComp = (m, p, l, s = null) => {
    return m.content.split(' ')[0] == p + l || (s && m.content.split(' ')[0] == p + s)
}

const WELCOME_CHANNEL = '922934040611405844'
const SERVER_ID = '830870811816099941'
const WELCOME_COLORS = [0xff0000, 0xff9100, 0xfbff00, 0x00ff37, 0x00ffd5, 0x0073ff, 0x8000ff, 0xff0084]
const IMAGE_URL = 'https://media.discordapp.net/attachments/815916673961426994/921741709421969450/RickAstley2021.jpeg?width=1392&height=884'

class Bot {
    constructor(token, settings) {
        this.settings = settings
        this.client = new Discord.Client({
            partials: ['USER', 'GUILD_MEMBER', 'MESSAGE', 'CHANNEL', 'REACTION'],
            intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS']
        })

        this.client.once('ready', () => {
            console.log(`Logged in as ${this.client.user.tag}!`)
            this.client.user.setActivity('bin da!', {
                type: 'PLAYING'
            })
            //setInterval(changeActivity, 5000)
        })

        this.client.on('guildMemberAdd', member => {
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
                            url: stg.image
                        }
                    }]
                })
            });
        });

        this.client.on('messageCreate', (msg) => {
            let r = respond(msg, this.stg.prefix)
            if (r) {
                console.log('change: ' + r)
            }
        })
        this.client.login(token)
    }
}




function respond(msg, prefix) {
    if (msg.author.bot) return
    //commands
    //ping
    if (shortComp(msg, prefix, 'ping', 'p')) {
        let ping = Date.now() - msg.createdAt
        msg.channel.send({
            embeds: [{
                color: ping > 800 ? 0xff000 : (ping > 200 ? 0xffea00 : 0x00ff6e),
                description: `Ping: ${ping}ms`
            }]
        })

        //help
    } else if (shortComp(msg, prefix, 'help', 'h')) {
        msg.channel.send({
            embeds: [{
                title: 'Befehle:',
                color: 0x00ff6e,
                thumbnail: {
                    url: IMAGE_URL
                },
                description: '*`Befehl #Zahl <Text> @User (optional)` `Kurzform von Befehl`*\n',
                fields: [{
                        name: 'Einstellungen',
                        value: `\`${stg.prefix}prefix <Prefix>\` \`${stg.prefix}pfx\` ändert den Prefix auf \`<Prefix>\`\n` +
                            `\`${stg.prefix}image <BildURL>\` \`${stg.prefix}img\` ändert das Willkommensbild auf \`<BildURL>\`. URL muss mit http oder https beginnen und darf maximal 200 zeichen lang sein\n`
                    },
                    {
                        name: 'Moderation',
                        value: `\`${stg.prefix}purge #Nachrichten\` \`${stg.prefix}prg\` löscht \`#Nachrichten\` Nachrichten\n` +
                            `\`${stg.prefix}ban @User (<Grund>) \` bannt \`@User\` mit dem Grund \`<Grund>\`\n` +
                            `\`${stg.prefix}unban <UserTag>/#UserID \` entbannt den User mit dem angegebenen Tag/der Angegebenen ID\n` +
                            `\`${stg.prefix}listbans\` \`${stg.prefix}lb\` listet alle gebannten User auf\n` +
                            `\`${stg.prefix}kick @User (<Grund>) \` kickt \`@User\` mit dem Grund \`<Grund>\`\n`
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
    } else if (shortComp(msg, prefix, 'purge', 'prg')) {
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
    } else if (shortComp(msg, prefix, 'ban') && msg.mentions.members.size == 1) {
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
    } else if (shortComp(msg, prefix, 'kick') && msg.mentions.members.size == 1) {
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
    } else if (shortComp(msg, prefix, 'listbans', 'lb')) {
        msg.guild.bans.fetch().then((b) => {
            const row = b.size > 6 ? new Discord.MessageActionRow().addComponents([
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
            ]) : {};
            // ^ if bans is short, don't create the object but {} instead
            msg.channel.send({
                embeds: [genBansEmbed(0, b, 1)],
                //passing {} will cause error
                components: b.size > 6 ? [row] : undefined
            }).then(b.size > 6 ? (rsp) => {
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
                            page = Math.min(page + 1, Math.max(Math.ceil(b.size / 6) - 1, 0))
                            break;
                        case '>>':
                            page = Math.max(Math.ceil(b.size / 6) - 1, 0)
                    }
                    i.update({
                        embeds: [genBansEmbed(page, b)]
                    })
                });

                collector.on('end', () => {
                    rsp.edit({
                        row: []
                    })
                });

            } : () => {})
        })
        //unban
    } else if (shortComp(msg, prefix, 'unban') && msg.content.split(" ")[1]) {
        if (!msg.member.permissions.has('BAN_MEMBERS')) {
            msg.channel.send({
                embeds: [{
                    color: 0xff0000,
                    description: 'Befehl gescheitert: fehlende Berechtigung:\n`BAN_MEMBERS`'
                }]
            })
            return
        }
        let opt = msg.content.split(" ")[1]
        let callback = (uid) => {
            msg.guild.bans.remove(uid).then((u) => {
                msg.channel.send({
                    embeds: [{
                        color: 0x00ff6e,
                        fields: [{
                            name: 'Befehl erfolgreich!',
                            value: `${u} ist nun nicht mehr gebannt`
                        }]
                    }]
                })
            }).catch((e) => {
                msg.channel.send({
                    embeds: [{
                        color: 0xff0000,
                        description: `Befehl gescheitert: User existiert entweder nicht oder ist nicht gebannt`
                    }]
                })
            })
        }
        if (opt.match(/^[0-9]+$/)) {
            callback(opt)
        } else if (opt.match(/^\S+#[0-9]{4}/)) {
            msg.guild.bans.fetch().then((bans) => {
                for (const b of bans.values()) {
                    if (b.user.tag == opt) {
                        callback(b.user.id)
                        return
                    }
                }
                msg.channel.send({
                    embeds: [{
                        color: 0xff0000,
                        description: `Befehl gescheitert: User ${opt} existiert entweder nicht oder ist nicht gebannt`
                    }]
                })
            })
        }
    } else if (shortComp(msg, prefix, 'userinfo', 'ui') && msg.mentions.members.size == 1) {
        let member = msg.mentions.members.first()
        msg.channel.send({
            embeds: [{
                color: member.roles.color ? member.roles.color.color : 0,
                description: `**Info über ${member}**`,
                thumbnail: {
                    url: member.displayAvatarURL({
                        format: 'png',
                        size: 512
                    })
                },
                fields: [{
                        name: 'User Tag',
                        value: member.user.tag
                    },
                    {
                        name: 'Bot',
                        value: member.user.bot ? 'Ja' : 'Nein'
                    },
                    {
                        name: 'Nick',
                        value: member.nickname || "kein Nick"
                    },
                    {
                        name: 'Server beigetreten',
                        value: member.joinedAt.toString()
                    },
                    {
                        name: 'Discord beigetreten',
                        value: member.user.createdAt.toString()
                    },
                    {
                        name: 'Rollen',
                        value: member.roles.cache.size.toString()
                    },
                    {
                        name: 'Höchste Rolle',
                        value: member.roles.highest.name
                    },
                    {
                        name: 'Server booster',
                        value: member.premiumSince ? (`seit ${member.premiumSince}`) : 'Nein'
                    },
                ]
            }]
        })
        //prefix
    } else if (shortComp(msg, prefix, 'prefix', 'pfx') && msg.content.split(' ')[1]) {
        if (!msg.member.permissions.has('MANAGE_GUILD')) {
            msg.channel.send({
                embeds: [{
                    color: 0xff0000,
                    description: 'Befehl gescheitert: fehlende Berechtigung:\n`MANAGE_GUILD`'
                }]
            })
            return
        }
        stg.prefix = msg.content.split(' ')[1]
        fs.writeFileSync('settings.json', JSON.stringify(stg));
        msg.channel.send({
            embeds: [{
                color: 0x00ff6e,
                description: `neuer prefix: ${stg.prefix}`
            }]
        })

        //image
    } else if (shortComp(msg, prefix, 'image', 'img') && msg.content.split(' ')[1].substring(0, 4) == 'http') {
        if (!msg.member.permissions.has('MANAGE_GUILD')) {
            msg.channel.send({
                embeds: [{
                    color: 0xff0000,
                    description: 'Befehl gescheitert: fehlende Berechtigung:\n`MANAGE_GUILD`'
                }]
            })
            return
        }
        stg.image = msg.content.split(' ')[1].substring(0, 200)
        fs.writeFileSync('settings.json', JSON.stringify(stg));
        msg.channel.send({
            embeds: [{
                color: 0x00ff6e,
                title: 'neues Willkommensbild',
                image: {
                    url: stg.image
                }
            }]
        })
    }
}

let bot = new Bot(BOT_TOKEN, {})

function genBansEmbed(page, bans) {
    let i = 0
    if (bans.size == 0) return {
        color: 0x00ff6e,
        description: 'niemand ist gebannt'
    }
    let e = {
        color: 0x00ff6e,
        title: 'Liste aller gebannten User',
        footer: {
            text: `insgesamt: ${bans.size} • Seite ${page+1}/${Math.ceil(bans.size/6)}`
        },
        fields: []
    }
    for (const b of bans.values()) {
        if (i >= page * 6 && i < (page + 1) * 6) {
            e.fields.push({
                name: b.user.tag,
                value: `${b.reason ? `Grund: ${b.reason}` : 'kein Grund angegeben'}\n--------`
            })
        }
        i++
    }
    return e
}

var a = false;
const splashes = ["ur mom", "sqrt(-1) am cool!", "6 ist perfekt!", "warum hat das Hünchen die straße überquert?", "12345678910987654321 ist eine Primzahl!"]
/*
function changeActivity() {
	if (a) {
		client.user.setActivity(`prefix: ${stg.prefix}`, {
			type: 'PLAYING'
		})
	} else {
		let rand = Math.floor(Math.random() * (splashes.length + 2))
		let activity = ''
		switch (rand){
			case 0:
				activity = `auf ${client.guilds.cache.size} Server${client.guilds.cache.size>1?'n':''}`
				break;
			case 1:
				let d = new Date
				activity = `es ist ${d.getHours()} Uhr und ${d.getMinutes()} Minuten`
				break;
			default:
				activity = splashes[rand-2]
		}
		client.user.setActivity(activity, {
			type: 'PLAYING'
		})
	}
	a = !a
}*/