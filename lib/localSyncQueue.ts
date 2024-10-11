import prisma from './prisma'
import { SyncQueueItem } from '../shared/types'

export async function addToSyncQueue(item: SyncQueueItem) {
  await prisma.atlasSyncQueue.create({
    data: item
  })
}

export async function processSyncQueue() {
  const queueItems = await prisma.atlasSyncQueue.findMany()

  for (const item of queueItems) {
    try {
      switch (item.operation) {
        case 'insert':
          await prisma[item.collection].create({ data: item.document })
          break
        case 'update':
          await prisma[item.collection].update({
            where: { id: item.document.id },
            data: item.document
          })
          break
        case 'delete':
          await prisma[item.collection].delete({
            where: { id: item.document.id }
          })
          break
      }
      await prisma.atlasSyncQueue.delete({ where: { id: item.id } })
    } catch (error) {
      console.error(`Failed to process sync queue item:`, error)
      // Implement retry logic or alert system here
    }
  }
}