import { Client, IntentsBitField, REST } from "discord.js"
import { IDiscordBot } from "./IDiscordBot"
import DbClient, { DbClient as PrismaClient } from "../prismaClient"

export class DiscordBot implements IDiscordBot {
  private client: Client
  private rest: REST
  private token: string
  private clientId: string
  private prisma: PrismaClient
  constructor(clientId: string, token: string, prisma: PrismaClient) {
    this.prisma = prisma
    this.token = token
    this.clientId = clientId
    this.client = new Client({
      intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
      ],
    })

    // Handlers
    this.client.on("ready", () => {
      console.log(`Logged in as ${this.client.user?.tag}`)
    })

    this.client.on("messageCreate", this.handleMessage)

    this.rest = new REST({ version: "10" }).setToken(this.token)

    this.client.login(this.token)
  }

  public handleMessage(): void {}

  public getClient(): Client {
    return this.client
  }

  private async setSlashCommands(guildIds: string[]): Promise<void> {}

  public async start() {
    await this.client.login(this.token)
  }
}

// Usage
const clientId = process.env.DISCORD_CLIENT_ID!
const token = process.env.DISCORD_TOKEN!
export const bot = new DiscordBot(clientId, token, DbClient)
