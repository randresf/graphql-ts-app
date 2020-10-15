import DataLoader from 'dataloader'
import { User } from '../entities/User'
// param [1,78,9]
// return [{id:1, ...usr}...]
export const createUserLoader = () => new DataLoader<number, User>(async (usrIds) => {
  const users = await User.findByIds(usrIds as number[]) // just one SQL statement
  const userIdToUser: Record<number, User> = {}
  users.forEach((u) => {
    userIdToUser[u.id] = u
  })
  return usrIds.map(userId => userIdToUser[userId])
})
