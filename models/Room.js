import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

export const ROOM_TYPES = {
  CONSUMER_TO_CONSUMER: 'consumer-to-consumer',
  CONSUMER_TO_SUPPORT: 'consumer-to-support',
}

const roomSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4().replace(/\-/g, ''),
    },
    userIds: Array,
    type: String,
    roomInitiator: String,
  },
  {
    timestamps: true,
    collection: 'rooms',
  }
)

roomSchema.statics.initiateRoom = async function (
	userIds, type, roomInitiator
) {
  try {
    const availableRoom = await this.findOne({
      userIds: {
        $size: userIds.length,
        $all: [...userIds],
      },
      type,
    })
    if (availableRoom) {
      return {
        isNew: false,
        message: 'retrieving an old room',
        roomId: availableRoom._doc._id,
        type: availableRoom._doc.type,
      }
    }

    const newRoom = await this.create({ userIds, type, roomInitiator })
    return {
      isNew: true,
      message: 'creating a new room',
      roomId: newRoom._doc._id,
      type: newRoom._doc.type,
    }
  } catch (error) {
    console.log('error on start room method', error)
    throw error
  }
}

roomSchema.statics.getRoomByRoomId = async function (roomId) {
  try {
    const room = await this.findOne({ _id: roomId })
    return room
  } catch (error) {
    throw error
  }
}

export default mongoose.model('Room', roomSchema)