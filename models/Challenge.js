import mongoose from "mongoose";

const relapseSchema = new mongoose.Schema({
  date: String,
  reason: String,
});

const taskSchema = new mongoose.Schema({
  id: Number,
  title: String,
  done: Boolean,
});

const challengeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // core fields
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },

    // target days
    dayTarget: { type: Number, default: 30 },

    // last checkin timestamp (ISO)
    lastCheckIn: { type: String, default: null },

    // computed boolean replaced by comparing lastCheckIn to today
    dailyChecked: { type: Boolean, default: false },

    relapseHistory: [relapseSchema],
    tasks: [taskSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Challenge ||
  mongoose.model("Challenge", challengeSchema);
