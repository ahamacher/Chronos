import { Client } from "discord.js"

export abstract class IDiscordBot {
  abstract getClient(): Client
  abstract handleMessage(): void
  abstract start(): Promise<void>
}
