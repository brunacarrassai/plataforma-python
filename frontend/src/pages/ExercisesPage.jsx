import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const difficultyConfig = {
  easy:   { label: 'Fácil',   color: 'text-green-400',  bg: 'bg-green-900/30 border-green-800' },
  medium: { label: 'Médio',   color: 'text-yellow-400', bg: 'bg-yellow-900/30 border-yellow-800' },
  hard:   { label: 'Difícil', color: 'text-red-400',    bg: 'bg-red-900/30 border-red-800' },
};

export default function ExercisesPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [exercises, setExercises] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [exRes, pgRes] = await Promise.all([
          api.get('/exercises?limit=50'),
          api.get('/progress'),
        ]);
        setExercises(exRes.data.exercises);
        const pgMap = {};
        pgRes.data.progress.forEach((p) => {
          pgMap[p.exercise._id] = p;
        });
        setProgress(pgMap);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = filter === 'all'
    ? exercises
    : filter === 'done'
    ? exercises.filter((ex) => progress[ex._id]?.completed)
    : exercises.filter((ex) => ex.difficulty === filter);

  const totalPoints = Object.values(progress).reduce((s, p) => s + (p.pointsEarned || 0), 0);
  const completedCount = Object.values(progress).filter((p) => p.completed).length;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐍</span>
          <span className="font-bold text-white">PyLearn</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')}
            className="text-sm text-gray-400 hover:text-white transition-colors">
            Dashboard
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>{user?.name}</span>
            <span className="text-yellow-400 font-medium">{totalPoints} pts</span>
          </div>
          <button onClick={logout}
            className="text-sm text-gray-500 hover:text-red-400 transition-colors">
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Título e stats */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Exercícios</h1>
          <p className="text-gray-400 text-sm">
            {completedCount} de {exercises.length} resolvidos
          </p>
          <div className="mt-3 h-1.5 bg-gray-800 rounded-full overflow-hidden w-64">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: exercises.length ? `${(completedCount / exercises.length) * 100}%` : '0%' }}
            />
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: 'all',    label: 'Todos' },
            { key: 'easy',   label: 'Fácil' },
            { key: 'medium', label: 'Médio' },
            { key: 'hard',   label: 'Difícil' },
            { key: 'done',   label: '✅ Resolvidos' },
          ].map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                filter === f.key
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin text-3xl">⟳</div>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((ex) => {
              const diff = difficultyConfig[ex.difficulty];
              const pg = progress[ex._id];
              return (
                <div key={ex._id}
                  onClick={() => navigate(`/exercises/${ex._id}`)}
                  className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-4
                             cursor-pointer transition-all hover:bg-gray-800/50 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="text-xl shrink-0">
                      {pg?.completed ? '✅' : pg ? '🔄' : '⭕'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-white truncate">{ex.title}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded border ${diff.bg} ${diff.color}`}>
                          {diff.label}
                        </span>
                        {ex.tags?.slice(0, 2).map((tag) => (
                          <span key={tag} className="text-xs text-gray-500">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-medium text-yellow-400">{ex.points} pts</p>
                    {pg?.attempts > 0 && (
                      <p className="text-xs text-gray-500">{pg.attempts} tentativa(s)</p>
                    )}
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                <p className="text-4xl mb-3">🔍</p>
                <p>Nenhum exercício encontrado</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}