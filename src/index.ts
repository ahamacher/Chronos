// application imports
import * as dotenv from "dotenv"
import "dotenv"
dotenv.config()

import { discordClient } from "./discordClient/"
import { setSlashCommands } from "./discordClient/deployCommands"

const token = process.env.DISCORD_TOKEN

discordClient.login(token).then(async () => {
  await setSlashCommands()
  console.log("Ready to Rock!")
})
