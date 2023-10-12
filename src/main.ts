// Application imports
import { Client, IntentsBitField } from "discord.js"
import * as dotenv from "dotenv"
import { DiscordClient } from "./discordClient/discordClient"
import DbClient from "./prismaClient"
dotenv.config()

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
})

export const DiscordInstance = new DiscordClient(client, DbClient)
