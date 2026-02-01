const display = document.getElementById('display');
const keys = document.querySelector('.keys');

let current = ''; // current expression shown

function updateDisplay(text){
  display.textContent = text || '0';
}

// sanitize and evaluate expression safely
function evaluateExpression(expr){
  // replace fancy operators with JS ones
  expr = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/%/g, '/100');
  // allow only digits, operators, parentheses, decimal and spaces
  if(!/^[0-9+\-*/().\s]+$/.test(expr)) throw new Error('Invalid characters');
  // evaluate using Function (simple and OK for local calculator)
  // protect against empty / malformed
  const result = Function('"use strict"; return (' + expr + ')')();
  if(!isFinite(result)) throw new Error('Math error');
  return result;
}

keys.addEventListener('click', e => {
  const t = e.target;
  if (!t.closest('button')) return;

  if (t.dataset.number !== undefined) {
    // number or dot
    const ch = t.dataset.number;
    // prevent multiple dots in last number
    if (ch === '.') {
      const parts = current.split(/[\+\-\*\/\(\)]/);
      const last = parts[parts.length - 1];
      if (last.includes('.')) return;
      if (last === '') current += '0'; // start decimal with 0.
    }
    current += ch;
    updateDisplay(current);
    return;
  }

  const action = t.dataset.action;
  if (action === 'clear') {
    current = '';
    updateDisplay('0');
    return;
  }
  if (action === 'back') {
    current = current.slice(0, -1);
    updateDisplay(current || '0');
    return;
  }
  if (action === 'op') {
    const op = t.textContent.trim();
    // avoid adding operator at start (except minus)
    if (current === '' && op !== '−') return;
    // map % handled in evaluate
    current += op;
    updateDisplay(current);
    return;
  }
  if (action === 'equals') {
    try {
      const res = evaluateExpression(current);
      // trim trailing .0 for integers
      current = (Number.isInteger(res) ? String(res) : String(parseFloat(res.toFixed(12))).replace(/\.?0+$/,''));
      updateDisplay(current);
    } catch (err) {
      updateDisplay('Error');
      current = '';
      setTimeout(() => updateDisplay('0'), 800);
    }
    return;
  }
});

// keyboard support
window.addEventListener('keydown', e => {
  if (e.key >= '0' && e.key <= '9') {
    document.querySelector(`[data-number="${e.key}"]`)?.click();
    return;
  }
  if (e.key === '.') { document.querySelector('[data-number="."]')?.click(); return; }
  if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); document.querySelector('[data-action="equals"]')?.click(); return; }
  if (e.key === 'Backspace') { document.querySelector('[data-action="back"]')?.click(); return; }
  if (e.key === 'Escape') { document.querySelector('[data-action="clear"]')?.click(); return; }

  const map = { '/':'÷', '*':'×', '-':'−', '+':'+' , '%':'%' };
  if (map[e.key]) {
    // button text uses symbols for × ÷ − etc; simulate click by finding by textContent
    const btn = Array.from(document.querySelectorAll('.btn-op')).find(b => b.textContent.trim() === map[e.key]);
    btn?.click();
  }
});
