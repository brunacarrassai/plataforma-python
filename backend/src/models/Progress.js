//Registra as tentativas e conquistas do usuário
const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    // referência ao usuário — ObjectId que aponta para a collection "users"
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // permite usar .populate('user') para trazer os dados do usuário
      required: true,
    },

    // referência ao exercício resolvido
    exercise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
      required: true,
    },

    // true = usuário passou em todos os test cases
    completed: {
      type: Boolean,
      default: false,
    },

    // Código que o usuário enviou (guardamos para revisão e histórico)
    submittedCode: {
      type: String,
      required: true,
    },

    // Resultado de cada test case nesta tentativa
    testResults: [
      {
        passed: Boolean,
        output: String,      // o que o código produziu
        expected: String,    // o que era esperado
      },
    ],

    // Pontos ganhos nesta tentativa (0 se não completou)
    pointsEarned: {
      type: Number,
      default: 0,
    },

    // Número de tentativas até completar (incrementado a cada submit)
    attempts: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

// Índice composto: busca rápida por usuário + exercício
// Permite verificar se um usuário já resolveu um exercício específico
progressSchema.index({ user: 1, exercise: 1 });

module.exports = mongoose.model('Progress', progressSchema);