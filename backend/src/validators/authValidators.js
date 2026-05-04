const Joi = require('joi');

//Schema de registro
const registerSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(60)
    .required()
    .messages({
      'string.min': 'Nome deve ter no mínimo 2 caracteres',
      'string.max': 'Nome deve ter no máximo 60 caracteres',
      'any.required': 'Nome é obrigatório',
    }),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .required()
    .messages({
      'string.email': 'Formato de email inválido',
      'any.required': 'Email é obrigatório',
    }),

  password: Joi.string()
    .min(6)
    .max(72)
    .required()
    .messages({
      'string.min': 'Senha deve ter no mínimo 6 caracteres',
      'any.required': 'Senha é obrigatória',
    }),

  level: Joi.string()
    .valid('beginner', 'intermediate', 'advanced')
    .default('beginner')
    .messages({
      'any.only': 'Nível deve ser beginner, intermediate ou advanced',
    }),
});

//Schema login
const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .required()
    .messages({
      'string.email': 'Formato de email inválido',
      'any.required': 'Email é obrigatório',
    }),

  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Senha é obrigatória',
    }),
});

module.exports = { registerSchema, loginSchema };