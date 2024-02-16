import { DateTime } from "luxon"
import { Client, IntentsBitField } from "discord.js"
import dbClient from "../prismaClient"

import {
  analyzeText,
  getVerboseTime,
  inferTimezone,
  getConversionText,
} from "../utils/"
import { setSlashCommandForGuild } from "./deployCommands"

const discordClient = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildMessages,
  ],
})

discordClient.once("ready", () => {
  if (discordClient?.user?.tag) {
    console.log(`Logged in as ${discordClient.user.tag}!`)
  } else {
    console.log("Logged in but had no tag")
  }
})

discordClient.on("messageCreate", async (msg) => {
  if (msg.author.id === discordClient?.user?.id) return
  const { content } = msg
  const analyzedText = analyzeText(content)
  let message = ""
  if (!analyzedText || !analyzeText.length) {
    return
  }

  // const user = await dbClient.getUser(msg.author.id)
  const user = null
  // console.log(`got a user: ${user}`)
  try {
    analyzedText.forEach((item) => {
      try {
        const vTime = getVerboseTime(item)
        const { smallName, timezone } = inferTimezone(item, user)
        console.log("smallName and Timezone: ", smallName, timezone)
        if (!timezone) return
        const dt = DateTime.fromFormat(vTime, "hhmm", { zone: timezone })
        message += getConversionText(
          dt,
          `${item.hour}:${item.minute}${
            item.meridiem ? item.meridiem : ""
          } ${smallName?.toUpperCase()}`
        )
        if (message) {
          message += "\n"
        }
      } catch (e) {
        if (process.env.DEV_MODE) {
          // logger for testing, too loud to keep on normally
          console.log(e)
        }
      }
    })
    if (!message) return
    msg.channel.send(message)
  } catch (err) {
    console.log(err)
  }
})

discordClient.on("guildCreate", async (guild) => {
  console.log("Bot added to a new guild: " + guild.name)
  setSlashCommandForGuild(guild.id)
})

discordClient.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return

  const { commandName } = interaction

  if (commandName === "tz_register") {
    const {
      user: { id },
      guildId,
    } = interaction
    if (!id || !guildId) return
    let option = interaction.options.get("tzcode")
    const user = await dbClient.getUser(id)
    if (!user) {
      dbClient.addUser({
        discordUserId: id,
        guildId,
        defaultTz: option?.value as string,
      })
    } else {
      dbClient.updateUser({
        id: user.id,
        defaultTz: option?.value as string,
      })
    }
    await interaction.reply({
      content: `Registered your time zone as "${option?.value}"! When referencing time you no longer need to include a timezone as it will default to your saved one`,
      // content: `Please go to [HERE](http://127.0.0.1:8080?discordUserId=${id}&guildId=${guildId}) to register your local timezone as default`,
      ephemeral: true,
    })
  }
})

export { discordClient }
