const Joi = require('joi');

//Schema de um test case
const testCaseSchema = Joi.object({
    input: Joi.string().allow('').default(''),
    expectedOutupt: Joi.string().required().messages({
        'any.required': 'Cada test case precisa de expectedOutup'
    }),
    description: Joi.string().allow('').default(''),
});

//Schema de criação de exercicio
const createExerciseSchema = Joi.object({
    title: Joi.string().trim().min(3).max(100).required().messages({
        'string.min': 'Título deve ter no mínimo 3 caracteres',
        'any.required': 'Título é obrigatório',
    }),

    description: Joi.string().min(10).required().messages({
        'string.min': 'Descrição deve ter no mínimo 10 caracteres',
        'any.required': 'Descrição é obrigatória'
    }),

    difficulty: Joi.string()
        .valid('easy', 'medium', 'hard')
        .required()
        .messages({
            'any.only': 'Dificuldade deve ser easy, medium ou hard',
            'any.required': 'Dificuldade é obrigatória',
        }),

    starterCode: Joi.string().allow('').default('# Escreva sua solução aqui\n'),

    solution: Joi.string().allow('').default(''),

    testCases: Joi.array()
        .items(testCaseSchema)
        .min(1)
        .required()
        .messages({
            'array-min': 'O exercício precisa ter pelo menos 1 test case',
            'any.required': 'testCases é obrigatório',
        }),

    tags: Joi.array().items(Joi.string().trim()).default([]),

    points: Joi.number().integer().min(1).max(100).default(10),
});

//Schema de filtros de listagem
const listExercisesSchema = Joi.object({
    difficulty: Joi.string().valid('easy', 'medium', 'hard'),
    tag: Joi.string().trim(),
    search: Joi.string().trim().max(100),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10),
});

//Schema submissão de código
const submitSchema = Joi.object({
    exerciseId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
        'string.pattern.base': 'exerciseId inválido',
        'any.required': 'exerciseId é obrigatório',
    }),

    code: Joi.string()
        .max(10000)
        .required()
        .messages({
            'string.max': 'Código muito longo (máx. 10.000 caracteres',
            'any.required': 'Código é obrigatório',
        }),

        testResults: Joi.array()
            .items(
                Joi.object({
                    passed: Joi.boolean().required(),
                    output: Joi.string().allow('').default(''),
                    expected: Joi.string().allow('').default(''),
                })
            )
            .min(1)
            .required()
            .messages({
                'array.min': 'testResults não pode ser vazio',
                'any.required': 'testResults é obrigatório',
            }),
});

module.exports = { createExerciseSchema, listExercisesSchema, submitSchema };



