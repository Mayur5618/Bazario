import mongoose from 'mongoose';

const searchHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  query: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Compound index for user and query
searchHistorySchema.index({ user: 1, query: 1 });

export default mongoose.model('SearchHistory', searchHistorySchema); 