import DataLoader from 'dataloader'
import { Updoot } from '../entities/Updoot'
// param [{postId:1, userId:5},{postId:7, userId:5},...]
// return [{postId:1, userId:5, points:1}] and Updoot
export const createUpdootLoader = () =>
  new DataLoader<{ postId: number, userId: number }, Updoot | null>(
    async (keys) => {
      const updoots = await Updoot.findByIds(keys as any)
      const updootIdsToUpdoot: Record<string, Updoot> = {}
      updoots.forEach((up) => {
        updootIdsToUpdoot[`${up.userId}|${up.postId}`] = up
      })
      return keys.map(ud => updootIdsToUpdoot[`${ud.userId}|${ud.postId}`])
    }
  )
