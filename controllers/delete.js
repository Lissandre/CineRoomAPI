import RoomModel from '../models/Room.js'
import RoomMessageModel from '../models/RoomMessage.js'

export default {
  deleteRoomById: async (req, res) => {
    try {
      const { roomId } = req.params
      const room = await RoomModel.remove({ _id: roomId })
      const messages = await RoomMessageModel.remove({ roomId: roomId })
      return res.status(200).json({ 
        success: true, 
        message: 'Operation performed succesfully',
        deletedRoomsCount: room.deletedCount,
        deletedMessagesCount: messages.deletedCount,
      })
    } catch (error) {
      return res.status(500).json({ success: false, error: error })
    }
  },
  deleteMessageById: async (req, res) => {
    try {
      const { messageId } = req.params
      const message = await RoomMessageModel.remove({ _id: messageId })
      return res.status(200).json({ 
        success: true, 
        deletedMessagesCount: message.deletedCount,
      })
    } catch (error) {
      return res.status(500).json({ success: false, error: error })
    }
  },
}