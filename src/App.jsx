import { useEffect, useMemo, useState } from 'react';

const SCIENTIFIC_KEYS = [
  { label: 'sin', type: 'func', fn: 'sin' },
  { label: 'cos', type: 'func', fn: 'cos' },
  { label: 'tan', type: 'func', fn: 'tan' },
  { label: 'abs', type: 'func', fn: 'abs' },
  { label: 'sqrt', type: 'func', fn: 'sqrt' },
  { label: 'log', type: 'func', fn: 'log' },
  { label: 'ln', type: 'func', fn: 'ln' },
  { label: 'x^y', type: 'func', fn: 'pow' },
  { label: 'x!', type: 'func', fn: 'factorial' },
  { label: 'mod', type: 'func', value: '%' },
  { label: '(', type: 'func', value: '(' },
  { label: ')', type: 'func', value: ')' },
  { label: 'pi', type: 'const', constant: 'PI' },
  { label: 'e', type: 'const', constant: 'E' },
  { label: 'Ans', type: 'const', constant: 'ANS' },
];

const MAIN_KEYS = [
  { label: '7', type: 'num', value: '7' },
  { label: '8', type: 'num', value: '8' },
  { label: '9', type: 'num', value: '9' },
  { label: '÷', type: 'op', value: '/' },
  { label: '4', type: 'num', value: '4' },
  { label: '5', type: 'num', value: '5' },
  { label: '6', type: 'num', value: '6' },
  { label: '×', type: 'op', value: '*' },
  { label: '1', type: 'num', value: '1' },
  { label: '2', type: 'num', value: '2' },
  { label: '3', type: 'num', value: '3' },
  { label: '-', type: 'op', value: '-' },
  { label: '0', type: 'num', value: '0' },
  { label: '.', type: 'num', value: '.' },
  { label: '=', type: 'equals', action: 'equals' },
  { label: '+', type: 'op', value: '+' },
];

function factorial(value) {
  if (!Number.isFinite(value) || value < 0 || Math.floor(value) !== value) {
    throw new Error('Factorial requires a non-negative integer.');
  }

  if (value > 170) {
    throw new Error('Result too large.');
  }

  let result = 1;
  for (let i = 2; i <= value; i += 1) {
    result *= i;
  }

  return result;
}

function normalizeNumber(output) {
  if (!Number.isFinite(output)) {
    throw new Error('Invalid output');
  }

  return Number.isInteger(output)
    ? String(output)
    : String(Number(output.toFixed(10)));
}

function transformExpression(rawExpression, ansValue, memoryValue) {
  let transformed = rawExpression;

  transformed = transformed.replace(/PI/g, 'Math.PI').replace(/\bE\b/g, 'Math.E');
  transformed = transformed.replace(/\bANS\b/g, `(${ansValue})`);
  transformed = transformed.replace(/\bMEM\b/g, `(${memoryValue})`);

  transformed = transformed.replace(/sin\(/g, 'SIN(');
  transformed = transformed.replace(/cos\(/g, 'COS(');
  transformed = transformed.replace(/tan\(/g, 'TAN(');
  transformed = transformed.replace(/sqrt\(/g, 'Math.sqrt(');
  transformed = transformed.replace(/ln\(/g, 'Math.log(');
  transformed = transformed.replace(/log\(/g, 'Math.log10(');
  transformed = transformed.replace(/abs\(/g, 'Math.abs(');
  transformed = transformed.replace(/(\d+\.?\d*|\([^()]*\)|Math\.[A-Za-z0-9_.()]+)!/g, 'factorial($1)');
  transformed = transformed.replace(/\^/g, '**');

  return transformed;
}

function evaluateExpression(rawExpression, angleMode, ansValue, memoryValue, strict = false) {
  if (!rawExpression.trim()) {
    return '0';
  }

  try {
    const toRadians = (value) => (angleMode === 'DEG' ? (value * Math.PI) / 180 : value);

    const transformed = transformExpression(rawExpression, ansValue, memoryValue);
    const evaluator = new Function(
      'factorial',
      'SIN',
      'COS',
      'TAN',
      `return (${transformed});`,
    );

    const output = evaluator(
      factorial,
      (value) => Math.sin(toRadians(value)),
      (value) => Math.cos(toRadians(value)),
      (value) => Math.tan(toRadians(value)),
    );

    return normalizeNumber(output);
  } catch (error) {
    if (strict) {
      throw error;
    }
    return '...';
  }
}

function getButtonClasses(type) {
  const base =
    'rounded-xl px-2 py-3 text-xs font-semibold transition active:scale-95 sm:px-3 sm:text-sm';
  const byType = {
    action: 'bg-rose-500/90 text-white hover:bg-rose-500',
    func: 'bg-violet-500/80 text-white hover:bg-violet-500',
    const: 'bg-indigo-500/85 text-white hover:bg-indigo-500',
    op: 'bg-sky-500/90 text-white hover:bg-sky-500',
    equals: 'bg-emerald-500/90 text-white hover:bg-emerald-500',
    num: 'bg-slate-700/90 text-slate-100 hover:bg-slate-600',
  };

  return `${base} ${byType[type] || byType.num}`;
}

export default function App() {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('0');
  const [justEvaluated, setJustEvaluated] = useState(false);
  const [angleMode, setAngleMode] = useState('DEG');
  const [memory, setMemory] = useState(0);
  const [history, setHistory] = useState([]);

  const ansValue = Number(result);
  const stableAnsValue = Number.isFinite(ansValue) ? ansValue : 0;

  const preview = useMemo(() => {
    if (!expression) {
      return '0';
    }
    return evaluateExpression(expression, angleMode, stableAnsValue, memory, false);
  }, [expression, angleMode, stableAnsValue, memory]);

  useEffect(() => {
    setResult(preview);
  }, [preview]);

  const appendValue = (value) => {
    setExpression((prev) => {
      const reset = justEvaluated && /[0-9.]/.test(value);
      return `${reset ? '' : prev}${value}`;
    });
    setJustEvaluated(false);
  };

  const insertFunction = (fn) => {
    const value = fn === 'pow' ? '^' : fn === 'factorial' ? '!' : `${fn}(`;
    setExpression((prev) => `${prev}${value}`);
    setJustEvaluated(false);
  };

  const insertConstant = (constant) => {
    if (constant === 'ANS') {
      appendValue('ANS');
      return;
    }

    setExpression((prev) => `${prev}${constant}`);
    setJustEvaluated(false);
  };

  const clearAll = () => {
    setExpression('');
    setResult('0');
    setJustEvaluated(false);
  };

  const deleteOne = () => {
    setExpression((prev) => prev.slice(0, -1));
    setJustEvaluated(false);
  };

  const evaluateFinal = () => {
    if (!expression.trim()) {
      return;
    }

    try {
      const evaluated = evaluateExpression(expression, angleMode, stableAnsValue, memory, true);
      setResult(evaluated);
      setExpression(evaluated);
      setHistory((prev) => [{ expression, result: evaluated }, ...prev].slice(0, 8));
      setJustEvaluated(true);
    } catch (_error) {
      setResult('Error');
      setJustEvaluated(false);
    }
  };

  const applyMemoryAction = (action) => {
    const value = Number(result);
    const numeric = Number.isFinite(value) ? value : 0;

    if (action === 'MC') {
      setMemory(0);
      return;
    }

    if (action === 'MR') {
      appendValue('MEM');
      return;
    }

    if (action === 'M+') {
      setMemory((prev) => prev + numeric);
      return;
    }

    if (action === 'M-') {
      setMemory((prev) => prev - numeric);
    }
  };

  const handleKeyAction = (key) => {
    if (/^[0-9]$/.test(key) || ['+', '-', '*', '/', '(', ')', '.', '%'].includes(key)) {
      appendValue(key);
      return;
    }

    if (key === '^') {
      appendValue('^');
      return;
    }

    if (key === '!') {
      insertFunction('factorial');
      return;
    }

    if (key === 'Enter' || key === '=') {
      evaluateFinal();
      return;
    }

    if (key === 'Backspace') {
      deleteOne();
      return;
    }

    if (key === 'Delete' || key.toLowerCase() === 'c') {
      clearAll();
      return;
    }

    if (key.toLowerCase() === 'r') {
      setAngleMode((prev) => (prev === 'DEG' ? 'RAD' : 'DEG'));
    }
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
      }
      handleKeyAction(event.key);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const handleButtonClick = (button) => {
    if (button.action === 'clear') {
      clearAll();
      return;
    }

    if (button.action === 'delete') {
      deleteOne();
      return;
    }

    if (button.action === 'equals') {
      evaluateFinal();
      return;
    }

    if (button.fn) {
      insertFunction(button.fn);
      return;
    }

    if (button.constant) {
      insertConstant(button.constant);
      return;
    }

    if (button.value) {
      appendValue(button.value);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_20%_15%,rgba(14,165,233,0.2),transparent_35%),radial-gradient(circle_at_90%_85%,rgba(124,58,237,0.24),transparent_30%),linear-gradient(160deg,#020617,#0f172a)] px-4 py-8">
      <section className="w-full max-w-5xl rounded-2xl border border-slate-600/40 bg-slate-900/80 p-4 shadow-2xl backdrop-blur-sm sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex rounded-lg border border-slate-700 bg-slate-950/70 p-1">
                <button
                  type="button"
                  className={`rounded-md px-3 py-1 text-xs font-semibold ${
                    angleMode === 'DEG' ? 'bg-cyan-500 text-white' : 'text-slate-300'
                  }`}
                  onClick={() => setAngleMode('DEG')}
                >
                  DEG
                </button>
                <button
                  type="button"
                  className={`rounded-md px-3 py-1 text-xs font-semibold ${
                    angleMode === 'RAD' ? 'bg-cyan-500 text-white' : 'text-slate-300'
                  }`}
                  onClick={() => setAngleMode('RAD')}
                >
                  RAD
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {['MC', 'MR', 'M+', 'M-'].map((action) => (
                  <button
                    key={action}
                    type="button"
                    className="rounded-lg border border-slate-600 px-2 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-700/60"
                    onClick={() => applyMemoryAction(action)}
                  >
                    {action}
                  </button>
                ))}
                <span className="rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-300">
                  M: {Number(memory.toFixed(6))}
                </span>
              </div>
            </div>

            <header className="mb-4 rounded-xl border border-slate-600/30 bg-slate-950/70 p-3 sm:p-4">
              <p className="min-h-6 break-all text-right text-sm text-slate-400">{expression}</p>
              <p className="mt-2 break-all text-right text-3xl font-semibold text-slate-100 sm:text-4xl">
                {result}
              </p>
            </header>

            <div className="mb-3 rounded-xl border border-slate-700/60 bg-slate-950/50 p-2">
              <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Scientific Functions
              </p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {SCIENTIFIC_KEYS.map((button) => (
                  <button
                    key={`${button.label}-${button.type}`}
                    type="button"
                    className={getButtonClasses(button.type)}
                    onClick={() => handleButtonClick(button)}
                  >
                    {button.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-700/60 bg-slate-950/50 p-2">
              <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Keypad
              </p>
              <div className="mb-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className={getButtonClasses('action')}
                  onClick={clearAll}
                >
                  AC
                </button>
                <button
                  type="button"
                  className={getButtonClasses('action')}
                  onClick={deleteOne}
                >
                  DEL
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
                {MAIN_KEYS.map((button) => (
                  <button
                    key={`${button.label}-${button.type}`}
                    type="button"
                    className={getButtonClasses(button.type)}
                    onClick={() => handleButtonClick(button)}
                  >
                    {button.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <aside className="rounded-xl border border-slate-700/60 bg-slate-950/60 p-3">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-200">History</h2>
              <button
                type="button"
                className="text-xs text-slate-400 hover:text-slate-200"
                onClick={() => setHistory([])}
              >
                Clear
              </button>
            </div>

            <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
              {history.length === 0 ? (
                <p className="text-xs text-slate-400">No calculations yet.</p>
              ) : (
                history.map((entry, index) => (
                  <button
                    key={`${entry.expression}-${index}`}
                    type="button"
                    className="w-full rounded-lg border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-left hover:bg-slate-800"
                    onClick={() => {
                      setExpression(entry.expression);
                      setResult(entry.result);
                      setJustEvaluated(false);
                    }}
                  >
                    <p className="truncate text-xs text-slate-400">{entry.expression}</p>
                    <p className="truncate text-sm font-semibold text-slate-100">= {entry.result}</p>
                  </button>
                ))
              )}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
