import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    default: '',
  },
  language: {
    type: String,
    default: 'es',
  },
  question: {
    type: String,
    required: true,
  },
  translatedQuestion: {
    type: String,
    default: '',
  },
  answer: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Conversation = mongoose.model('Conversation', ConversationSchema);

export default Conversation;
