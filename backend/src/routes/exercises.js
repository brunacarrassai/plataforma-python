const express = require('express');
const Exercise = require('../models/Exercise');
const auth = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createExerciseSchema, listExercisesSchema } = require('../validators/exerciseValidators');

const router = express.Router();

// GET /api/exercises
router.get('/', validate(listExercisesSchema, 'query'), async (req, res, next) => {
    try {
        const { difficulty, tag, search, page, limit } = req.query;

        const filter = {};
        if (difficulty) filter.difficulty = difficulty;
        if (tag) filter.tag = tag;
        if (search) filter.$text = { $search: search };

        const skip = (page - 1) * limit;

        // Executa query e contagem em paralelo - mais rápido que sequencial
        const [exercises, total] = await Promise.all([
            Exercise.find(filter)
                .select('-solution -testCases.expectedOutput')
                .sort({ difficulty: 1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Exercise.countDocuments(filter),
        ]);

        res.json({
            exercises,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1,
            },
        });
    } catch(error) {
        next(error);
    }
});

// GET /api/exercises/:id
router.get('/:id', async (req, res, next) => {
    try {
        const exercise = await Exercise.findById(req.params.id).select('-solution');

        if(!exercise) {
            const err = new Error('Exercicio não encontrado');
            err.status = 404;
            return next(err);
        }

        res.json({ exercise });
    } catch (error) {
        next(error);
    }
});

// POST /api/exercises
router.post('/', auth, validate(createExerciseSchema), async (req, res, next) => {
    try {
        const exercise = await Exercise.create(req.body);
        res.status(201).json({ exercise });
    } catch (error) {
        next(error);
    }
});

// POST /api/exercises/seed
router.post('/seed', async (req, res, next) => {
  try {
    await Exercise.deleteMany({});

    const exercises = await Exercise.insertMany([
      {
        title: 'Olá, Mundo!',
        description: 'Escreva um programa que imprime `Olá, Mundo!` na tela.',
        difficulty: 'easy',
        starterCode: '# Dica: use a função print()\n',
        solution: "print('Olá, Mundo!')",
        testCases: [
          { expectedOutput: 'Olá, Mundo!', description: 'Imprime a saudação correta' },
        ],
        tags: ['básico', 'print'],
        points: 5,
      },
      {
        title: 'Soma de dois números',
        description: 'Dados dois números `a = 3` e `b = 7`, calcule e imprima a soma.',
        difficulty: 'easy',
        starterCode: 'a = 3\nb = 7\n# Calcule e imprima a soma\n',
        solution: 'a = 3\nb = 7\nprint(a + b)',
        testCases: [
          { expectedOutput: '10', description: 'Soma correta de 3 + 7' },
        ],
        tags: ['básico', 'aritmética'],
        points: 5,
      },
      {
        title: 'FizzBuzz',
        description: 'Imprima números de 1 a 15. Múltiplos de 3: "Fizz". Múltiplos de 5: "Buzz". Múltiplos de ambos: "FizzBuzz".',
        difficulty: 'medium',
        starterCode: 'for i in range(1, 16):\n    # seu código aqui\n    pass\n',
        solution: 'for i in range(1, 16):\n    if i % 15 == 0:\n        print("FizzBuzz")\n    elif i % 3 == 0:\n        print("Fizz")\n    elif i % 5 == 0:\n        print("Buzz")\n    else:\n        print(i)',
        testCases: [
          {
            expectedOutput: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz',
            description: 'Saída completa do FizzBuzz 1-15',
          },
        ],
        tags: ['loops', 'condicionais', 'clássico'],
        points: 15,
      },
      {
        title: 'Inverter uma string',
        description: 'Dada a string `texto = "Python"`, imprima ela invertida.',
        difficulty: 'easy',
        starterCode: 'texto = "Python"\n# Imprima a string invertida\n',
        solution: 'texto = "Python"\nprint(texto[::-1])',
        testCases: [
          { expectedOutput: 'nohtyP', description: 'String Python invertida' },
        ],
        tags: ['strings', 'slicing'],
        points: 10,
      },
      {
        title: 'Números pares',
        description: 'Dada a lista `numeros = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]`, imprima apenas os pares, um por linha.',
        difficulty: 'easy',
        starterCode: 'numeros = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]\n# Imprima os pares\n',
        solution: 'numeros = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]\nfor n in numeros:\n    if n % 2 == 0:\n        print(n)',
        testCases: [
          { expectedOutput: '2\n4\n6\n8\n10', description: 'Números pares de 1 a 10' },
        ],
        tags: ['listas', 'loops'],
        points: 10,
      },
      {
        title: 'Fatorial',
        description: 'Calcule e imprima o fatorial de 5 (5! = 120).',
        difficulty: 'medium',
        starterCode: 'n = 5\n# Calcule o fatorial de n e imprima\n',
        solution: 'n = 5\nresult = 1\nfor i in range(1, n + 1):\n    result *= i\nprint(result)',
        testCases: [
          { expectedOutput: '120', description: 'Fatorial de 5' },
        ],
        tags: ['loops', 'matemática'],
        points: 15,
      },
    ]);

    res.json({ message: `${exercises.length} exercícios criados`, count: exercises.length });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
