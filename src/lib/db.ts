import mongoose from "mongoose";

const MONGO_URI = "mongodb+srv://kasunsagara689_db_user:19191920@cluster0.lhklthz.mongodb.net/?appName=Cluster0";

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Database connected");
  } catch (error) {
    console.log("Database connection error:", error);
  }
};

