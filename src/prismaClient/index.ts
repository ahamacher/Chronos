import { PrismaClient, User } from "@prisma/client"

export const prisma = new PrismaClient()

export type UpdateUserInput = Pick<User, "id" | "defaultTz">
export type CreateUserInput = Pick<
  User,
  "guildId" | "discordUserId" | "defaultTz"
>

class DbClient {
  private _prisma: PrismaClient
  constructor() {
    this._prisma = new PrismaClient()
  }

  private async connect() {
    await this._prisma.$connect()
  }

  async addUser({ guildId, discordUserId, defaultTz }: CreateUserInput) {
    try {
      await this.connect()
      await this._prisma.user.create({
        data: {
          guildId,
          discordUserId,
          defaultTz,
        },
      })
    } catch (e) {
      console.error("Error adding a user: ", e)
    }
  }

  async updateUser({ id, defaultTz }: UpdateUserInput) {
    try {
      await this.connect()
      await this._prisma.user.findFirstOrThrow({ where: { id } })
      await this._prisma.user.update({
        where: {
          id,
        },
        data: {
          defaultTz,
        },
      })
    } catch (e) {
      console.error("Error Updating a user: ", e)
    }
  }

  async getAllUsers() {
    try {
      await this.connect()
      const allUsers = await this._prisma.user.findMany()
      return allUsers
    } catch (e) {
      console.error("Error getting all users; ", e)
    }
  }

  async getUser(discordUserId: string): Promise<User | null> {
    try {
      await this.connect()
      const user = await this._prisma.user.findFirstOrThrow({
        where: {
          discordUserId,
        },
      })
      return user
    } catch (e) {
      // this is so noisy, doesn't need to fail loudly
      // console.error(e);
      // console.error(
      //   `There was an error getting the specific user ${discordUserId}`
      // );
      return null
    }
  }
}

export default new DbClient()
