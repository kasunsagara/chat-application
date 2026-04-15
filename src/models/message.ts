import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  room: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Message =
  mongoose.models.messages || mongoose.model("messages", messageSchema);

export default Message;