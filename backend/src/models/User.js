//Schema do usuário no MongoDB
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Schema define a "forma" dos documentos nesta collection
// Pense como uma classe com validação embutida
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true, // remove espaços extras no início/fim
    },

    email: {
      type: String,
      required: [true, 'Email é obrigatório'],
      unique: true, // garante que não haverá dois usuários com o mesmo email
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Email inválido'], // validação por regex
    },

    password: {
      type: String,
      required: [true, 'Senha é obrigatória'],
      minlength: [6, 'Senha deve ter no mínimo 6 caracteres'],
      // select: false faz com que o campo NÃO venha nas queries por padrão
      // protege a senha de vazar acidentalmente nas respostas da API
      select: false,
    },

    // Nível de dificuldade preferido do usuário
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
  },
  {
    // timestamps: true adiciona createdAt e updatedAt automaticamente
    timestamps: true,
  }
);

// HOOK: hash da senha antes de salvar
// "pre save" roda antes de qualquer .save() — aqui fazemos o hash da senha
// NUNCA guarde senhas em texto puro no banco
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// ─── Método de instância: comparar senha ─────────────────────────────────────
// Adicionamos um método ao schema para comparar senha informada vs hash no banco
// Uso: const isMatch = await user.comparePassword('senha123')
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Cria o model a partir do schema
// O Mongoose vai criar (ou usar) a collection "users" no MongoDB
module.exports = mongoose.model('User', userSchema);