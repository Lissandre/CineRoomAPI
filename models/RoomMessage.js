import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

const MESSAGE_TYPES = {
  TYPE_TEXT: 'text',
}

const readByRecipientSchema = new mongoose.Schema(
  {
    _id: false,
    readByUserId: String,
    readAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    timestamps: false,
  }
)

const roomMessageSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4().replace(/\-/g, ''),
    },
    roomId: String,
    message: mongoose.Schema.Types.Mixed,
    type: {
      type: String,
      default: () => MESSAGE_TYPES.TYPE_TEXT,
    },
    postedByUser: String,
    readByRecipients: [readByRecipientSchema],
  },
  {
    timestamps: true,
    collection: 'roommessages',
  }
)

roomMessageSchema.statics.createPostInRoom = async function (roomId, message, postedByUser) {
  try {
    const post = await this.create({
      roomId,
      message,
      postedByUser,
      readByRecipients: { readByUserId: postedByUser }
    })
    const aggregate = await this.aggregate([
      // get post where _id = post._id
      { $match: { _id: post._id } },
      // do a join on another table called users, and 
      // get me a user whose _id = postedByUser
      {
        $lookup: {
          from: 'users',
          localField: 'postedByUser',
          foreignField: '_id',
          as: 'postedByUser',
        }
      },
      { $unwind: '$postedByUser' },
      // do a join on another table called rooms, and 
      // get me a room whose _id = roomId
      {
        $lookup: {
          from: 'rooms',
          localField: 'roomId',
          foreignField: '_id',
          as: 'roomInfo',
        }
      },
      { $unwind: '$roomInfo' },
      { $unwind: '$roomInfo.userIds' },
      // do a join on another table called users, and 
      // get me a user whose _id = userIds
      {
        $lookup: {
          from: 'users',
          localField: 'roomInfo.userIds',
          foreignField: '_id',
          as: 'roomInfo.userProfile',
        }
      },
      { $unwind: '$roomInfo.userProfile' },
      // group data
      {
        $group: {
          _id: '$roomInfo._id',
          postId: { $last: '$_id' },
          roomId: { $last: '$roomInfo._id' },
          message: { $last: '$message' },
          type: { $last: '$type' },
          postedByUser: { $last: '$postedByUser' },
          readByRecipients: { $last: '$readByRecipients' },
          roomInfo: { $addToSet: '$roomInfo.userProfile' },
          createdAt: { $last: '$createdAt' },
          updatedAt: { $last: '$updatedAt' },
        }
      }
    ])
    return aggregate[0]
  } catch (error) {
    throw error
  }
}

roomMessageSchema.statics.getConversationByRoomId = async function (roomId, options = {}) {
  try {
    return this.aggregate([
      { $match: { roomId } },
      { $sort: { createdAt: -1 } },
      // do a join on another table called users, and 
      // get me a user whose _id = postedByUser
      {
        $lookup: {
          from: 'users',
          localField: 'postedByUser',
          foreignField: '_id',
          as: 'postedByUser',
        }
      },
      { $unwind: "$postedByUser" },
      // apply pagination
      { $skip: options.page * options.limit },
      { $limit: options.limit },
      { $sort: { createdAt: 1 } },
    ])
  } catch (error) {
    throw error
  }
}

roomMessageSchema.statics.markMessageRead = async function (roomId, currentUserOnlineId) {
  try {
    return this.updateMany(
      {
        roomId,
        'readByRecipients.readByUserId': { $ne: currentUserOnlineId }
      },
      {
        $addToSet: {
          readByRecipients: { readByUserId: currentUserOnlineId }
        }
      },
      {
        multi: true
      }
    )
  } catch (error) {
    throw error
  }
}

export default mongoose.model('RoomMessage', roomMessageSchema)