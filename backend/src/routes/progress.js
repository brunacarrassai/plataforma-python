const express = require('express');
const Progress = require('../models/Progress');
const Exercise = require('../models/Exercise');
const auth = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { submitSchema } = require('../validators/exerciseValidators');

const router = express.Router();

// Todas as rotas de progresso exigem login
router.use(auth);

// POST /api/progress/submit
// Recebe os resultados do Pyodide e salva no banco
router.post('/submit', validate(submitSchema), async (req, res, next) => {
  try {
    const { exerciseId, code, testResults } = req.body;

    const exercise = await Exercise.findById(exerciseId);
    if (!exercise) {
      return res.status(404).json({ error: 'Exercício não encontrado' });
    }

    const allPassed = testResults.every((r) => r.passed);
    const pointsEarned = allPassed ? exercise.points : 0;

    // Verifica se já existe uma tentativa anterior
    let progress = await Progress.findOne({
      user: req.user._id,
      exercise: exerciseId,
    });

    if (progress) {
      progress.attempts += 1;
      progress.submittedCode = code;
      progress.testResults = testResults;
      if (allPassed) {
        progress.completed = true;
        progress.pointsEarned = pointsEarned;
      }
      await progress.save();
    } else {
      progress = await Progress.create({
        user: req.user._id,
        exercise: exerciseId,
        completed: allPassed,
        submittedCode: code,
        testResults,
        pointsEarned,
      });

      if (allPassed) {
        await Exercise.findByIdAndUpdate(exerciseId, { $inc: { solvedCount: 1 } });
      }
    }

    res.json({
      completed: allPassed,
      pointsEarned,
      attempts: progress.attempts,
      testResults,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/progress
router.get('/', async (req, res, next) => {
  try {
    const progressList = await Progress.find({ user: req.user._id })
      .populate('exercise', 'title difficulty points tags')
      .sort({ updatedAt: -1 })
      .lean();

    const stats = {
      totalAttempts: progressList.length,
      completed: progressList.filter((p) => p.completed).length,
      totalPoints: progressList.reduce((sum, p) => sum + p.pointsEarned, 0),
    };

    res.json({ progress: progressList, stats });
  } catch (error) {
    next(error);
  }
});

// GET /api/progress/:exerciseId
router.get('/:exerciseId', async (req, res, next) => {
  try {
    const progress = await Progress.findOne({
      user: req.user._id,
      exercise: req.params.exerciseId,
    });

    res.json({ progress: progress || null });
  } catch (error) {
    next(error);
  }
});

module.exports = router;