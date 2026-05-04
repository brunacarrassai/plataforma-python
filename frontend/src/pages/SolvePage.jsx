import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePyodide } from '../hooks/usePyodide';
import CodeEditor from '../components/CodeEditor';
import TestResults from '../components/TestResults';
import ExerciseDescription from '../components/ExerciseDescription';
import api from '../services/api';

export default function SolvePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [exercise, setExercise] = useState(null);
  const [progress, setProgress] = useState(null);
  const [code, setCode] = useState('');
  const [testResults, setTestResults] = useState(null);
  const [runError, setRunError] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('results');
  const [freeOutput, setFreeOutput] = useState('');

  const { isLoading: pyodideLoading, loadError: pyodideError, runCode, runTests } = usePyodide();

  // Carrega exercício e progresso
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [exerciseRes, progressRes] = await Promise.all([
          api.get(`/exercises/${id}`),
          api.get(`/progress/${id}`).catch(() => ({ data: { progress: null } })),
        ]);
        setExercise(exerciseRes.data.exercise);
        setProgress(progressRes.data.progress);
        if (progressRes.data.progress?.submittedCode) {
          setCode(progressRes.data.progress.submittedCode);
        } else {
          setCode(exerciseRes.data.exercise.starterCode || '');
        }
      } catch (err) {
        console.error('Erro ao carregar exercício:', err);
      }
    };
    fetchData();
  }, [id]);

  // Execução livre
  const handleRunFree = useCallback(async () => {
    if (pyodideLoading || !code.trim()) return;
    setIsRunning(true);
    setRunError(null);
    setActiveTab('output');
    const result = await runCode(code);
    setFreeOutput(result.success ? result.output : result.error);
    if (!result.success) setRunError(result.error);
    setIsRunning(false);
  }, [code, pyodideLoading, runCode]);

  // Testar contra test cases — vem ANTES do useEffect do Ctrl+Enter
  const handleExecute = useCallback(async () => {
    if (pyodideLoading || !code.trim() || !exercise) return;
    setIsRunning(true);
    setRunError(null);
    setActiveTab('results');
    try {
      const results = await runTests(code, exercise.testCases);
      setTestResults(results);
      if (!results[0]?.passed && results[0]?.error) {
        setRunError(results[0].error);
      }
    } catch (err) {
      setRunError(err.message);
    }
    setIsRunning(false);
  }, [code, exercise, pyodideLoading, runTests]);

  // Ouve Ctrl+Enter — vem DEPOIS de handleExecute
  useEffect(() => {
    const handleRunCode = () => handleExecute();
    window.addEventListener('run-code', handleRunCode);
    return () => window.removeEventListener('run-code', handleRunCode);
  }, [handleExecute]);

  // Submeter ao backend
  const handleSubmit = async () => {
    if (!testResults || isSubmitting) return;
    setIsSubmitting(true);
    try {
      console.log('exerciseId:', id);
      console.log('testResults:', JSON.stringify(testResults));
      
      const res = await api.post('/progress/submit', {
        exerciseId: id,
        code,
        testResults,
      });
      setProgress((prev) => ({
        ...prev,
        completed: res.data.completed,
        attempts: res.data.attempts,
        pointsEarned: res.data.pointsEarned,
      }));
      if (res.data.completed) {
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (err) {
      console.error('Erro ao submeter:', err);
    }
    setIsSubmitting(false);
  };

  const allPassed = testResults?.every((r) => r.passed);

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <header className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800 shrink-0">
        <button onClick={() => navigate('/')}
          className="text-gray-400 hover:text-white text-sm transition-colors">
          ← Exercícios
        </button>
        <h1 className="text-sm font-medium text-gray-200 truncate max-w-xs">
          {exercise?.title || 'Carregando...'}
        </h1>
        <div className="text-xs">
          {pyodideLoading ? (
            <span className="text-yellow-400 flex items-center gap-1">
              <span className="animate-pulse">●</span> Carregando Python...
            </span>
          ) : pyodideError ? (
            <span className="text-red-400">● Erro ao carregar Python</span>
          ) : (
            <span className="text-green-400">● Python pronto</span>
          )}
        </div>
      </header>

      {/* Layout principal */}
      <div className="flex flex-1 overflow-hidden">

        {/* Descrição */}
        <div className="w-80 shrink-0 bg-gray-900 border-r border-gray-800 overflow-hidden">
          <ExerciseDescription exercise={exercise} progress={progress} />
        </div>

        {/* Editor */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-gray-900 border-b border-gray-800 shrink-0">
            <span className="text-xs text-gray-500 font-mono">solution.py</span>
            <div className="flex gap-2">
              <button onClick={handleRunFree} disabled={pyodideLoading || isRunning}
                className="text-xs px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors disabled:opacity-40">
                ▶ Rodar
              </button>
              <button onClick={handleExecute} disabled={pyodideLoading || isRunning}
                className="text-xs px-3 py-1.5 bg-blue-700 hover:bg-blue-600 rounded transition-colors disabled:opacity-40">
                {isRunning ? '⟳ Executando...' : '⚡ Testar'}
              </button>
              {allPassed && (
                <button onClick={handleSubmit} disabled={isSubmitting}
                  className="text-xs px-3 py-1.5 bg-green-700 hover:bg-green-600 rounded transition-colors disabled:opacity-40 font-medium">
                  {isSubmitting ? 'Enviando...' : '✅ Enviar solução'}
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <CodeEditor value={code} onChange={setCode} />
          </div>
        </div>

        {/* Resultados */}
        <div className="w-80 shrink-0 bg-gray-900 border-l border-gray-800 flex flex-col overflow-hidden">
          <div className="flex border-b border-gray-800 shrink-0">
            {[{ key: 'results', label: '🧪 Testes' }, { key: 'output', label: '📤 Output' }].map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex-1 text-xs py-2.5 transition-colors ${
                  activeTab === tab.key
                    ? 'text-white border-b-2 border-blue-500 bg-gray-800/50'
                    : 'text-gray-500 hover:text-gray-300'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-auto">
            {activeTab === 'results' ? (
              <TestResults results={testResults} isRunning={isRunning} error={runError} />
            ) : (
              <div className="p-4">
                {freeOutput ? (
                  <pre className="text-gray-300 text-xs font-mono whitespace-pre-wrap bg-gray-950 rounded p-3 border border-gray-800">
                    {freeOutput}
                  </pre>
                ) : (
                  <p className="text-gray-500 text-xs text-center mt-8">
                    Clique em "Rodar" para ver o output
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}