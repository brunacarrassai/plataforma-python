import { useState, useEffect, useRef } from 'react';

export function usePyodide() {
  const pyodideRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    const loadPyodide = async () => {
      try {
        // Aguarda o window.loadPyodide ficar disponível
        let attempts = 0;
        while (!window.loadPyodide && attempts < 20) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          attempts++;
        }

        if (!window.loadPyodide) {
          throw new Error('Pyodide CDN não carregado. Verifique o index.html.');
        }

        const pyodide = await window.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.0/full/',
        });

        // Configura captura do stdout — intercepta o print() do Python
        await pyodide.runPythonAsync(`
import sys

class OutputCapture:
    def __init__(self):
        self.output = []
    def write(self, text):
        self.output.append(text)
    def flush(self):
        pass
    def get_output(self):
        return ''.join(self.output)
    def clear(self):
        self.output = []

_capture = OutputCapture()
sys.stdout = _capture
sys.stderr = _capture
        `);

        pyodideRef.current = pyodide;
        setIsLoading(false);
      } catch (err) {
        setLoadError(err.message);
        setIsLoading(false);
      }
    };

    loadPyodide();
  }, []);

  // Executa código livre e retorna output
  const runCode = async (code) => {
    if (!pyodideRef.current) {
      return { success: false, output: '', error: 'Pyodide não está carregado' };
    }

    const pyodide = pyodideRef.current;

    try {
      await pyodide.runPythonAsync('_capture.clear()');
      await pyodide.runPythonAsync(code);
      const output = await pyodide.runPythonAsync('_capture.get_output()');

      return { success: true, output: output.trimEnd(), error: null };
    } catch (err) {
      const errorMessage = err.message
        .split('\n')
        .filter(line => !line.includes('File "<exec>"'))
        .join('\n')
        .trim();

      return { success: false, output: '', error: errorMessage };
    }
  };

  // Executa código contra múltiplos test cases
  const runTests = async (code, testCases) => {
    const results = [];

    for (const testCase of testCases) {
      const codeToRun = testCase.input
        ? `_input = "${testCase.input}"\n${code}`
        : code;

      const result = await runCode(codeToRun);

      const passed = result.success &&
        result.output === testCase.expectedOutput?.trimEnd();

      results.push({
        passed,
        output: result.success ? result.output : result.error,
        expected: testCase.expectedOutput?.trimEnd() || '',
        error: result.error,
      });
    }

    return results;
  };

  return { isLoading, loadError, runCode, runTests };
}