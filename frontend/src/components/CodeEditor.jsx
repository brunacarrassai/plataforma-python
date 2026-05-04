import Editor from '@monaco-editor/react';

export default function CodeEditor({ value, onChange, readOnly = false }) {
  const editorOptions = {
    fontSize: 14,
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    fontLigatures: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    lineNumbers: 'on',
    renderLineHighlight: 'line',
    tabSize: 4,
    insertSpaces: true,
    wordWrap: 'on',
    automaticLayout: true,
    readOnly,
    quickSuggestions: {
      other: true,
      comments: false,
      strings: false,
    },
    
  };

  const handleMount = (editor) => {
    editor.focus();

    // Ctrl+Enter para executar
    editor.addCommand(
      2048 | 3,
      () => {
        window.dispatchEvent(new CustomEvent('run-code'));
      }
    );
  };

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-gray-700">
      <Editor
        height="100%"
        defaultLanguage="python"
        value={value}
        onChange={onChange}
        theme="vs-dark"
        options={editorOptions}
        onMount={handleMount}
        loading={
          <div className="flex items-center justify-center h-full bg-gray-900 text-gray-400">
            <span className="text-sm">Carregando editor...</span>
          </div>
        }
      />
    </div>
  );
}



