const difficultyConfig = {
  easy:   { label: 'Fácil',   className: 'bg-green-900/50 text-green-400 border-green-700' },
  medium: { label: 'Médio',   className: 'bg-yellow-900/50 text-yellow-400 border-yellow-700' },
  hard:   { label: 'Difícil', className: 'bg-red-900/50 text-red-400 border-red-700' },
};

export default function ExerciseDescription({ exercise, progress }) {
    if (!exercise) {
        return (
         <div className="flex items-center justify-center h-full text-gray-400">
            <div className="animate-spin text-2xl">⟳</div>
         </div>
        );
    }

    const diff = difficultyConfig[exercise.difficulty] || difficultyConfig.easy;

    return (
    <div className="h-full overflow-auto p-6 space-y-5">
      {/* Cabeçalho */}
      <div>
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${diff.className}`}>
            {diff.label}
          </span>
          <span className="text-xs text-gray-500">
            {exercise.points} pts
          </span>
          {progress?.completed && (
            <span className="text-xs bg-green-900/50 text-green-400 border border-green-700 px-2.5 py-1 rounded-full">
              Resolvido
            </span>
          )}
        </div>
        <h1 className="text-xl font-bold text-white">
          {exercise.title}
        </h1>
      </div>

      {/* Descrição */}
      <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
        {exercise.description}
      </div>

      {/* Tags */}
      {exercise.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {exercise.tags.map((tag) => (
            <span key={tag}
              className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded border border-gray-700">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Dica de tentativas */}
      {progress && !progress.completed && (
        <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-lg p-3 text-xs text-yellow-400">
          💡 Você já tentou {progress.attempts} vez(es). Continue tentando!
        </div>
      )}
    </div>
  );
}
