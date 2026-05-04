import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🐍</div>
          <h1 className="text-2xl font-bold text-white">PyLearn</h1>
          <p className="text-gray-400 text-sm mt-1">Aprenda Python na prática</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <h2 className="text-lg font-semibold text-white mb-6">Entrar na conta</h2>
          {error && (
            <div className="bg-red-950 border border-red-800 text-red-400 text-sm rounded-lg p-3 mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required
                placeholder="bruna@email.com"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white
                           placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500
                           focus:ring-1 focus:ring-blue-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Senha</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} required
                placeholder="••••••"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white
                           placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500
                           focus:ring-1 focus:ring-blue-500 transition-colors" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50
                         disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg
                         transition-colors text-sm mt-2">
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          <p className="text-center text-gray-500 text-sm mt-6">
            Não tem conta?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 transition-colors">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}