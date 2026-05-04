const mongoose = require('mongoose');

// Cada "test case" tem uma entrada e a saída esperada
// O Pyodide vai rodar o código do usuário e comparar com expectedOutput
const testCaseSchema = new mongoose.Schema({
  // Entrada que será passada para o código (via stdin ou variável)
  input: {
    type: String,
    default: '',
  },
  // Saída exata que o código deve produzir para este caso
  expectedOutput: {
    type: String,
    required: true,
  },
  // Descrição legível do que este teste verifica
  description: {
    type: String,
    default: '',
  },
});

const exerciseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Título é obrigatório'],
      trim: true,
    },

    // Enunciado em Markdown — suporta formatação, exemplos de código, etc.
    description: {
      type: String,
      required: [true, 'Descrição é obrigatória'],
    },

    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },

    // Código de exemplo que aparece no editor quando o exercício é aberto
    starterCode: {
      type: String,
      default: '# Escreva sua solução aqui\n',
    },

    // Solução oficial (para referência do admin, não exposta ao usuário)
    solution: {
      type: String,
      select: false, // nunca retorna nas queries comuns
    },

    // Array de casos de teste — o código é testado contra todos eles
    testCases: [testCaseSchema],

    // Tags para filtragem: ['loops', 'strings', 'listas', ...]
    tags: [{ type: String, trim: true }],

    // Pontos que o exercício vale (usado no sistema de progresso)
    points: {
      type: Number,
      default: 10,
    },

    // Quantas vezes este exercício foi resolvido com sucesso
    solvedCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Índice de texto para busca por título e tags
exerciseSchema.index({ title: 'text', tags: 'text' });

module.exports = mongoose.model('Exercise', exerciseSchema);