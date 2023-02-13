import { Router, Request, Response } from 'express';
import DbClient from '../prismaClient'

const routes = Router();

// Set default time zone
routes.post('/api/zone', async (req: Request, res: Response) => {
  // const { discordUserId, guildId, defaultTz } = req.body;
  console.log(req.body)
  // try {
  //   // See if the user has been previously registered
  //   const user = await DbClient.getUser(discordUserId)

  //   if (user) {
  //     // Update the existing user
  //     await DbClient.updateUser({ id: user.id, defaultTz })
  //   } else {
  //     // Create the new user field
  //     await DbClient.addUser({ guildId, discordUserId, defaultTz })
  //   }

  //   res.status(201).send({ message: 'Success' })
  // } catch (err) {
  //   // Log error, TODO: get better logging in the future
  //   console.error(err)
  //   res.status(500).send(err)
  // }
  res.json({
    message: "success"
  })
})

export default routes;
