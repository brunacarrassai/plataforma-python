import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const levels = [
  { value: 'beginner',     label: 'Iniciante',    desc: 'Nunca programei ou estou começando' },
  { value: 'intermediate', label: 'Intermediário', desc: 'Conheço o básico de programação' },
  { value: 'advanced',     label: 'Avançado',      desc: 'Tenho experiência com outras linguagens' },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', level: 'beginner' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      setError('Senha deve ter no mínimo 6 caracteres');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(form.name, form.email, form.password, form.level);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar conta');
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
          <p className="text-gray-400 text-sm mt-1">Crie sua conta gratuitamente</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <h2 className="text-lg font-semibold text-white mb-6">Criar conta</h2>
          {error && (
            <div className="bg-red-950 border border-red-800 text-red-400 text-sm rounded-lg p-3 mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Nome</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required
                placeholder="Seu nome"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white
                           placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500
                           focus:ring-1 focus:ring-blue-500 transition-colors" />
            </div>
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
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white
                           placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500
                           focus:ring-1 focus:ring-blue-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Seu nível</label>
              <div className="space-y-2">
                {levels.map((lvl) => (
                  <label key={lvl.value}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      form.level === lvl.value
                        ? 'border-blue-500 bg-blue-950/30'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}>
                    <input type="radio" name="level" value={lvl.value}
                      checked={form.level === lvl.value} onChange={handleChange}
                      className="mt-0.5 accent-blue-500" />
                    <div>
                      <p className="text-white text-sm font-medium">{lvl.label}</p>
                      <p className="text-gray-500 text-xs">{lvl.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50
                         disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg
                         transition-colors text-sm mt-2">
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>
          <p className="text-center text-gray-500 text-sm mt-6">
            Já tem conta?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}