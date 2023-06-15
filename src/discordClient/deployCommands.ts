import { REST } from "@discordjs/rest"
import { Routes, SlashCommandBuilder } from "discord.js"
import timezones from "../timezones"

import { discordClient } from "./DiscordClient"

const tzOptions = [...new Set(Object.values(timezones))]

const tzRegister = new SlashCommandBuilder()
  .setName("tz_register")
  .setDescription("Registers your timezone")
  .addStringOption((option) => {
    option.setName("tzcode").setDescription("Local Timezone").setRequired(true)
    tzOptions.forEach((tz) => {
      option.addChoices({ name: tz, value: tz })
    })
    return option
  })

const commands = [tzRegister]

const getRegisteredCommands = (data: unknown) => {
  const commandList: Array<string> = []
  try {
    const arrayData = data as Array<any>
    arrayData.forEach((item) => {
      if (item?.name) {
        commandList.push(item.name)
      }
    })
  } catch (e) {
    console.error("Error with getting the command list", e)
    return
  }
  return commandList
}

export const setSlashCommands = async () => {
  const token = process.env.DISCORD_TOKEN
  if (!token) {
    throw new Error("Missing discord token!")
  }
  const guilds = await discordClient!.guilds!.fetch()

  // TODO convert to promise.all to await them
  guilds.forEach(async (guild) => {
    await setSlashCommandForGuild(guild.id)
  })
}

export const setSlashCommandForGuild = async (guildId: string) => {
  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN!)
  const clientId = discordClient!.user!.id
  await rest
    .put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    })
    .then((data) =>
      console.log(
        `Successfully registered [${getRegisteredCommands(
          data
        )}] application commands.`
      )
    )
    .catch(console.error)
}
