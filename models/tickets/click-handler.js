'use strict';
const Discord = require('discord.js');
const fs = require('fs');
require('dotenv').config();
const taRole = process.env.TA_ROLE;
const instRole = process.env.INST_ROLE;
const QUEUE = process.env.QUEUE;
const CLAIMED = process.env.CLAIMED;
const points = require('../points');
let claimedTickets = [];

const getTickets = () => {
  claimedTickets = JSON.parse(fs.readFileSync('tickets.json', 'utf-8'));
};

const updateTickets = (newClaimedTickets) => {
  newClaimedTickets = JSON.stringify(newClaimedTickets);
  fs.writeFileSync('tickets.json', newClaimedTickets, function (err) {
    console.log(err.message);
  });
};

const checkClaim = (channelID) => {
  let flag = false;
  let claimerID;
  claimedTickets.forEach((ticket) => {
    if (channelID == ticket.channelID) {
      flag = true;
      claimerID = ticket.claimerID;
    }
  });
  return flag ? claimerID : false;
};

const claimTicket = (channelID, claimerID) => {
  claimedTickets.push({ channelID, claimerID });
  updateTickets(claimedTickets);
};

const unClaimTicket = (channelID) => {
  claimedTickets = claimedTickets.filter((ticket) => ticket.channelID !== channelID);
  updateTickets(claimedTickets);
};

const claimingMessage = async (button, row, type) => {
  const embedClaim = new Discord.MessageEmbed().setDescription(`Ticket ${type}ed by <@${button.clicker.user.id}>`).setColor(type === 'claim' ? '#4CAF50' : '#f44336');
  button.channel.send(embedClaim);
  const embed = new Discord.MessageEmbed().setDescription(`Support will be with you shortly.
  To close this ticket click on 🔒`).setTitle('ASAC Tickets System').setFooter('by Abdulhakim Zatar').setColor('#b006c6');
  await button.message.edit(button.message.content, { embed, component: row });
};

const unsupport = async (button) => {
  const notSupport = new Discord.MessageEmbed().setDescription(`You can't claim/unclaim the ticket <@${button.clicker.user.id}>`).setColor('#f44336');
  button.channel.send(notSupport);
  return;
};



module.exports = async (button, row, type) => {
  await button.clicker.fetch();
  await button.channel.fetch();
  const roles = button.clicker.member._roles;
  if ((!roles.includes(taRole) && !roles.includes(instRole))) {
    unsupport(button);
    return;
  }

  getTickets();
  if (type === 'claim' && !checkClaim(button.channel.id)) {
    const permissions = button.channel.permissionOverwrites;
    button.channel.setParent(CLAIMED);
    button.channel.overwritePermissions(permissions);
    // let name = button.channel.name;
    // name = '📘' + name.slice(2, name.length - 2) + '📘';
    //  button.channel.setName(name);
    claimTicket(button.channel.id, button.clicker.user.id);
    claimingMessage(button, row, type);
    points.addPoint(button.clicker.user.id);
    // await button.channel.fetch();
    // await button.channel.lockPermissions();


    setTimeout(() => {
      button.channel.setParent(CLAIMED);
      button.channel.overwritePermissions(permissions);
    }, 500);

  }

  if (type === 'unclaim' && checkClaim(button.channel.id)) {
    const claimer = checkClaim(button.channel.id);
    if (claimer !== button.clicker.user.id) {
      const notSupport = new Discord.MessageEmbed().setDescription(`Ticket already claimed <@${button.clicker.user.id}>`).setColor('#f44336');
      button.channel.send(notSupport);
      return;
    }
    const permissions = button.channel.permissionOverwrites;

    // let name = button.channel.name;
    // name = '📗' + name.slice(2, name.length - 2) + '📗';
    //  button.channel.setName(name);
    unClaimTicket(button.channel.id);
    claimingMessage(button, row, type);
    points.removePoint(button.clicker.user.id);
    setTimeout(() => {
      button.channel.setParent(QUEUE);
      button.channel.overwritePermissions(permissions);
    }, 500);
  }
};