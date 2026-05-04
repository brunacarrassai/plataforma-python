// pages/DashboardPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/progress').then((res) => {
      setStats(res.data.stats);
      setHistory(res.data.progress.slice(0, 10));
    }).finally(() => setLoading(false));
  }, []);

  const diffColor = { easy: 'text-green-400', medium: 'text-yellow-400', hard: 'text-red-400' };
  const diffLabel = { easy: 'Fácil', medium: 'Médio', hard: 'Difícil' };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐍</span>
          <span className="font-bold">PyLearn</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')}
            className="text-sm text-gray-400 hover:text-white transition-colors">
            Exercícios
          </button>
          <button onClick={logout}
            className="text-sm text-gray-500 hover:text-red-400 transition-colors">
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Olá, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-gray-400 text-sm mt-1">Aqui está seu progresso na plataforma</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin text-3xl">⟳</div>
          </div>
        ) : (
          <>
            {/* Cards de estatísticas */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Exercícios tentados', value: stats?.totalAttempts || 0, icon: '📝' },
                { label: 'Resolvidos',           value: stats?.completed || 0,     icon: '✅' },
                { label: 'Pontos totais',        value: stats?.totalPoints || 0,   icon: '⭐' },
              ].map((card) => (
                <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center">
                  <div className="text-3xl mb-2">{card.icon}</div>
                  <div className="text-2xl font-bold text-white">{card.value}</div>
                  <div className="text-xs text-gray-400 mt-1">{card.label}</div>
                </div>
              ))}
            </div>

            {/* Histórico */}
            <div>
              <h2 className="text-base font-semibold mb-4 text-gray-200">Atividade recente</h2>
              {history.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-4xl mb-3">🚀</p>
                  <p className="text-sm">Você ainda não resolveu nenhum exercício.</p>
                  <button onClick={() => navigate('/')}
                    className="mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                    Começar agora →
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((item) => (
                    <div key={item._id}
                      onClick={() => navigate(`/exercises/${item.exercise._id}`)}
                      className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-4
                                 flex items-center justify-between cursor-pointer transition-all hover:bg-gray-800/50">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{item.completed ? '✅' : '🔄'}</span>
                        <div>
                          <p className="text-sm font-medium text-white">{item.exercise.title}</p>
                          <p className={`text-xs ${diffColor[item.exercise.difficulty]}`}>
                            {diffLabel[item.exercise.difficulty]} · {item.attempts} tentativa(s)
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-yellow-400">
                          {item.pointsEarned > 0 ? `+${item.pointsEarned} pts` : '—'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(item.updatedAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}