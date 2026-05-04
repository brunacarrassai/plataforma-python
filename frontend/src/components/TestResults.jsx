export default function TestResults({ results, isRunning, error }) {
  // Antes de executar
  if (!results && !isRunning && !error) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        <div className="text-center">
          <p className="text-2xl mb-2">▶</p>
          <p>Execute o código para ver os resultados</p>
          <p className="text-xs mt-1 text-gray-500">Ctrl+Enter para executar</p>
        </div>
      </div>
    );
  }

  // Executando
  if (isRunning) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <div className="animate-spin text-3xl mb-2">⟳</div>
          <p className="text-sm">Executando Python...</p>
        </div>
      </div>
    );
  }

  // Erro de sintaxe ou runtime
  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-950 border border-red-800 rounded-lg p-4">
          <p className="text-red-400 font-medium text-sm mb-2">❌ Erro de execução</p>
          <pre className="text-red-300 text-xs font-mono whitespace-pre-wrap overflow-auto max-h-48">
            {error}
          </pre>
        </div>
      </div>
    );
  }

  //resultados
  const allPassed = results.every((r) => r.passed);
  const passedCount = results.filter((r) => r.passed).length;

  return (
    <div className="p-4 space-y-3 overflow-auto">
      {/* Resumo */}
      <div className={`rounded-lg p-3 text-sm font-medium ${
        allPassed
          ? 'bg-green-950 border border-green-800 text-green-400'
          : 'bg-yellow-950 border border-yellow-800 text-yellow-400'
      }`}>
        {allPassed
          ? `🎉 Todos os testes passaram! (${passedCount}/${results.length})`
          : `${passedCount} de ${results.length} testes passaram`
        }
      </div>

      {/* Detalhe de cada teste */}
      {results.map((result, index) => (
        <div key={index}
          className={`rounded-lg border p-3 text-xs font-mono ${
            result.passed
              ? 'bg-green-950/30 border-green-800/50'
              : 'bg-red-950/30 border-red-800/50'
          }`}>
          <p className={`font-medium mb-2 text-sm ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
            {result.passed ? '✅' : '❌'} Teste {index + 1}
          </p>

          <div className="mb-2">
            <span className="text-gray-500">Seu output:</span>
            <pre className="text-gray-300 mt-1 bg-gray-900 rounded p-2 whitespace-pre-wrap overflow-auto max-h-24">
              {result.output || '(vazio)'}
            </pre>
          </div>

          {!result.passed && (
            <div>
              <span className="text-gray-500">Esperado:</span>
              <pre className="text-green-300 mt-1 bg-gray-900 rounded p-2 whitespace-pre-wrap overflow-auto max-h-24">
                {result.expected || '(vazio)'}
              </pre>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}