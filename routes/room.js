import express from 'express'
// controllers
import room from '../controllers/room.js'

const router = express.Router()

router
  .get('/', room.getRecentConversation)
  .get('/:roomId', room.getConversationByRoomId)
  .post('/initiate', room.initiate)
  .post('/:roomId/message', room.postMessage)
  .put('/:roomId/mark-read', room.markConversationReadByRoomId)

export default router