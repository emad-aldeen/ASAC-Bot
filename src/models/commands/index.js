require('dotenv').config();
const PREFIX = process.env.PREFIX;
const COMMANDS_CHANNEL = process.env.COMMANDS_CHANNEL;
const DEV_CHANNEL = process.env.DEV_CHANNEL;
const Discord = require('discord.js');

const validatePermissions = (permissions) => {
  const validPermissions = [
    'CREATE_INSTANT_INVITE',
    'KICK_MEMBERS',
    'BAN_MEMBERS',
    'ADMINISTRATOR',
    'MANAGE_CHANNELS',
    'MANAGE_GUILD',
    'ADD_REACTIONS',
    'VIEW_AUDIT_LOG',
    'PRIORITY_SPEAKER',
    'STREAM',
    'VIEW_CHANNEL',
    'SEND_MESSAGES',
    'SEND_TTS_MESSAGES',
    'MANAGE_MESSAGES',
    'EMBED_LINKS',
    'ATTACH_FILES',
    'READ_MESSAGE_HISTORY',
    'MENTION_EVERYONE',
    'USE_EXTERNAL_EMOJIS',
    'VIEW_GUILD_INSIGHTS',
    'CONNECT',
    'SPEAK',
    'MUTE_MEMBERS',
    'DEAFEN_MEMBERS',
    'MOVE_MEMBERS',
    'USE_VAD',
    'CHANGE_NICKNAME',
    'MANAGE_NICKNAMES',
    'MANAGE_ROLES',
    'MANAGE_WEBHOOKS',
    'MANAGE_EMOJIS',
  ];

  for (const permission of permissions) {
    if (!validPermissions.includes(permission)) {
      throw new Error(`Unknown permission node "${permission}"`);
    }
  }
};

module.exports = (client, commandOptions) => {
  let {
    commands,
    expectedArgs = '',
    permissionError = 'You do not have permission to run this command.',
    minArgs = 0,
    maxArgs = null,
    permissions = [],
    requiredRoles = [],
    callback,
    channels = [COMMANDS_CHANNEL, DEV_CHANNEL,'858910622905008159'],
  } = commandOptions;

  // Ensure the command and aliases are in an array
  if (typeof commands === 'string') {
    commands = [commands];
  }

  console.log(`Registering command "${commands[0]}"`);

  // Ensure the permissions are in an array and are all valid
  if (permissions.length) {
    if (typeof permissions === 'string') {
      permissions = [permissions];
    }

    validatePermissions(permissions);
  }

  // Listen for messages
  client.on('message', (message) => {
    const { member, content, guild } = message;
    let channelFlag = false;
    for (const channel of channels) {
      if (channel == message.channel.id) channelFlag = true;
    }
    if (!channelFlag) return;

    for (const alias of commands) {
      const command = `${PREFIX}${alias.toLowerCase()}`;

      if (
        content.toLowerCase().startsWith(`${command} `) ||
        content.toLowerCase() === command
      ) {
        // A command has been ran

        // Ensure the user has the required permissions
        for (const permission of permissions) {
          if (!member.hasPermission(permission)) {
            message.reply(permissionError);
            return;
          }
        }

        // Ensure the user has the required roles
        let flag = false;
        for (const requiredRole of requiredRoles) {
          const role = guild.roles.cache.find((role) => role.name === requiredRole);
          if (member.roles.cache.has(role.id)) {
            flag = true;
          }
        }

        if (!flag) {
          message.reply(`You must have the instructor role to use this command.`);
          return;
        }

        // Split on any number of spaces
        const args = content.split(/[ ]+/);

        // Remove the command which is the first index
        args.shift();

        // Ensure we have the correct number of args
        if (
          args.length < minArgs ||
          (maxArgs !== null && args.length > maxArgs)
        ) {
          message.reply(`Incorrect syntax! Use ${PREFIX}${alias} ${expectedArgs}`);
          return;
        }

        // Handle the custom command code
        const embedLog = new Discord.MessageEmbed()
          .addFields(
            { inline: true, name: 'User', value: `<@${message.author.id}>` },
            { inline: true, name: 'Command', value: message.content },
          )
          .setAuthor(message.author.username, message.author.avatarURL())
          .setColor('#008CBA')
          .setFooter('ASAC Bot - commands');

        callback(message, args, args.join(' '), client);
        client.channels.fetch('858566167228579901').then((channel)=>{
          channel.send(embedLog);
        });

        return;
      }
    }
  });
};