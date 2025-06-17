import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  question: String,
  answer: String,
  timestamp: { type: Date, default: Date.now }
});

const ConversationSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  messages: [MessageSchema],
  createdAt: { type: Date, default: Date.now }
});

const Conversation = mongoose.model('Conversation', ConversationSchema);

export default Conversation;
