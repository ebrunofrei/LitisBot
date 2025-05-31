// backend/models/Agenda.js
import mongoose from 'mongoose';

const AgendaSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  titulo: {
    type: String,
    required: true,
  },
  descripcion: {
    type: String,
    default: '',
  },
  fecha: {
    type: String,
    required: true,
  },
  hora: {
    type: String,
    default: '',
  },
  alertaMinutosAntes: {
    type: Number,
    default: 10,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Agenda = mongoose.model('Agenda', AgendaSchema);

export default Agenda;
