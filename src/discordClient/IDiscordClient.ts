import { Client } from "discord.js"

export abstract class IDiscordClient {
  // abstract setSlashCommands(guildIds: string[]): Promise<void>
  // abstract getClient(): Client
  abstract login(DISCORD_TOKEN: string): Promise<Client>
}
