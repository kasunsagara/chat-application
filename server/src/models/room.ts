import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  roomId: { 
    type: String, 
    required: true, 
    unique: true,
    default: () => String(Math.floor(1000 + Math.random() * 9000))
  },
  name: { 
    type: String, 
    required: true 
  },
  members: { 
    type: [String], 
    required: true 
  }, // Array of User IDs
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

// Clear any cached models (useful during development when schemas change)
if (mongoose.models.Room) {
  delete mongoose.models.Room;
}

export default mongoose.model("Room", roomSchema);
