import { Client, IntentsBitField } from "discord.js"
import { IDiscordClient } from "./IDiscordClient"
import { DbClient as PrismaClient } from "../prismaClient"

export class DiscordClient implements IDiscordClient {
  private client: Client
  private prisma: PrismaClient
  constructor(client: Client, prisma: PrismaClient) {
    this.client = client
    this.prisma = prisma
    const discordApiToken = process.env.DISCORD_TOKEN
    this.login(discordApiToken!)
  }

  // getClient(): Client {}

  // setSlashCommands(guildIds: string[]): Promise<void> {}

  async login(DISCORD_TOKEN: string): Promise<Client> {
    this.client = this.client.once("ready", () => {
      if (this.client.user?.tag) {
        console.log(`Logged in as ${this.client.user.tag}`)
      } else {
        console.log("Logged in but had no tag")
      }
    })

    await this.client.login(DISCORD_TOKEN)
    return this.client
  }
}
