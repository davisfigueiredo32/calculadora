/* ==========================================================================
   Calculadora Moderna – lógica
   Sem eval(): cada operação é calculada por uma função própria.
   ========================================================================== */

const OPERATIONS = {
  add:      { symbol: "+", run: (a, b) => a + b },
  subtract: { symbol: "−", run: (a, b) => a - b },
  multiply: { symbol: "×", run: (a, b) => a * b },
  divide:   { symbol: "÷", run: (a, b) => a / b },
};

const MAX_DIGITS = 15;

/* ---------- Funções auxiliares de número ---------- */

// Remove ruídos de ponto flutuante (ex.: 0.1 + 0.2 = 0.30000000000000004).
function normalize(value) {
  return parseFloat(value.toPrecision(12));
}

// Converte número em texto "interno" (ponto decimal, sem separador de milhar).
function numberToString(value) {
  const n = normalize(value);
  if (n === 0) return "0";
  const abs = Math.abs(n);
  if (abs >= 1e15 || abs < 1e-6) {
    return n.toExponential(6).replace(/\.?0+e/, "e");
  }
  return String(n);
}

// Converte texto interno em texto legível (pt-BR: 1.234,56).
function formatForDisplay(text) {
  if (text.includes("e")) return text.replace(".", ",");
  const negative = text.startsWith("-");
  const [integer, decimal] = text.replace("-", "").split(".");
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return (negative ? "-" : "") + grouped + (decimal !== undefined ? "," + decimal : "");
}

function formatNumber(value) {
  return formatForDisplay(numberToString(value));
}

/* ---------- Estado e regras da calculadora ---------- */

class Calculator {
  constructor() {
    this.clearAll();
  }

  clearAll() {
    this.current = "0";          // número que está sendo digitado ou exibido
    this.previous = null;        // primeiro operando
    this.operator = null;        // chave de OPERATIONS
    this.expression = "";        // linha pequena acima do resultado
    this.awaitingOperand = false; // operador acabou de ser escolhido
    this.replaceOnInput = false;  // próxima digitação substitui o número atual
    this.error = null;
  }

  fail(message) {
    this.clearAll();
    this.error = message;
  }

  startFresh() {
    if (this.error) this.clearAll();
    if (this.replaceOnInput) {
      this.current = "0";
      this.replaceOnInput = false;
      this.awaitingOperand = false;
      if (!this.operator) this.expression = "";
    }
  }

  inputDigit(digit) {
    this.startFresh();
    if (this.current.replace(/[-.]/g, "").length >= MAX_DIGITS) return;
    if (this.current === "0") this.current = digit;
    else if (this.current === "-0") this.current = "-" + digit;
    else this.current += digit;
  }

  inputDecimal() {
    this.startFresh();
    if (!this.current.includes(".")) this.current += ".";
  }

  delete() {
    if (this.error) return this.clearAll();
    if (this.replaceOnInput) return;
    this.current = this.current.slice(0, -1);
    if (this.current === "" || this.current === "-") this.current = "0";
  }

  toggleSign() {
    if (this.error) return;
    if (parseFloat(this.current) === 0) return;
    this.current = this.current.startsWith("-") ? this.current.slice(1) : "-" + this.current;
  }

  percent() {
    if (this.error) return;
    const value = parseFloat(this.current);
    let result = value / 100;
    // Em "100 + 10%", 10% significa 10% de 100.
    if (this.operator && this.previous !== null && !this.awaitingOperand) {
      if (this.operator === "add" || this.operator === "subtract") {
        result = (this.previous * value) / 100;
      }
    }
    this.current = numberToString(result);
    this.replaceOnInput = true;
  }

  chooseOperator(operator) {
    if (this.error) return;

    if (this.operator && this.awaitingOperand) {
      // Troca de operador antes de digitar o segundo número.
      this.operator = operator;
    } else {
      if (this.operator) {
        const result = this.calculate(this.previous, parseFloat(this.current), this.operator);
        if (result === null) return;
        this.previous = result;
        this.current = numberToString(result);
      } else {
        this.previous = parseFloat(this.current);
      }
      this.operator = operator;
    }

    this.awaitingOperand = true;
    this.replaceOnInput = true;
    this.expression = `${formatNumber(this.previous)} ${OPERATIONS[operator].symbol}`;
  }

  equals() {
    if (this.error || !this.operator) return;
    const a = this.previous;
    const b = parseFloat(this.current);
    const symbol = OPERATIONS[this.operator].symbol;
    const result = this.calculate(a, b, this.operator);
    if (result === null) return;

    this.expression = `${formatNumber(a)} ${symbol} ${formatNumber(b)} =`;
    this.current = numberToString(result);
    this.previous = null;
    this.operator = null;
    this.awaitingOperand = false;
    this.replaceOnInput = true;
  }

  // Retorna o resultado ou null (e entra em estado de erro).
  calculate(a, b, operator) {
    if (!Number.isFinite(a) || !Number.isFinite(b)) {
      this.fail("Entrada inválida");
      return null;
    }
    if (operator === "divide" && b === 0) {
      this.fail("Não é possível dividir por zero");
      return null;
    }
    const result = OPERATIONS[operator].run(a, b);
    if (!Number.isFinite(result)) {
      this.fail("Resultado fora do limite");
      return null;
    }
    return result;
  }
}

/* ---------- Interface (apenas no navegador) ---------- */

function initUI() {
  const calculator = new Calculator();
  const resultEl = document.getElementById("result");
  const expressionEl = document.getElementById("expression");
  const keypad = document.getElementById("keypad");
  const operatorButtons = keypad.querySelectorAll('[data-action="operator"]');

  // Reduz a fonte até o número caber no display.
  function fitResult() {
    resultEl.style.fontSize = "";
    if (resultEl.classList.contains("is-error")) return;
    let size = parseFloat(getComputedStyle(resultEl).fontSize);
    while (resultEl.scrollWidth > resultEl.clientWidth && size > 18) {
      size -= 2;
      resultEl.style.fontSize = size + "px";
    }
  }

  function render() {
    const hasError = calculator.error !== null;
    resultEl.classList.toggle("is-error", hasError);
    resultEl.textContent = hasError ? calculator.error : formatForDisplay(calculator.current);
    expressionEl.textContent = calculator.expression;

    operatorButtons.forEach((button) => {
      const active = calculator.awaitingOperand && button.dataset.value === calculator.operator;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    fitResult();
  }

  function handle(action, value) {
    switch (action) {
      case "digit":    calculator.inputDigit(value); break;
      case "decimal":  calculator.inputDecimal(); break;
      case "operator": calculator.chooseOperator(value); break;
      case "equals":   calculator.equals(); break;
      case "clear":    calculator.clearAll(); break;
      case "delete":   calculator.delete(); break;
      case "percent":  calculator.percent(); break;
      case "sign":     calculator.toggleSign(); break;
    }
    render();
  }

  // Cliques e toques
  keypad.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (button) handle(button.dataset.action, button.dataset.value);
  });

  // Teclado físico
  const keyboardMap = {
    "+": ["operator", "add"],
    "-": ["operator", "subtract"],
    "*": ["operator", "multiply"],
    "x": ["operator", "multiply"],
    "X": ["operator", "multiply"],
    "/": ["operator", "divide"],
    "=": ["equals"],
    "Enter": ["equals"],
    ".": ["decimal"],
    ",": ["decimal"],
    "%": ["percent"],
    "Backspace": ["delete"],
    "Escape": ["clear"],
    "Delete": ["clear"],
  };

  function flashButton(key) {
    const lookup = { "=": "Enter", ",": ".", "x": "*", "X": "*", "Delete": "Escape" };
    const dataKey = lookup[key] || key;
    const button = keypad.querySelector(`[data-key="${CSS.escape(dataKey)}"]`);
    if (!button) return;
    button.classList.add("is-pressed");
    setTimeout(() => button.classList.remove("is-pressed"), 120);
  }

  document.addEventListener("keydown", (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;

    if (/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      handle("digit", event.key);
      flashButton(event.key);
      return;
    }

    const entry = keyboardMap[event.key];
    if (!entry) return;
    event.preventDefault(); // evita o Enter "clicar" no botão focado e a busca rápida do Firefox no "/"
    handle(entry[0], entry[1]);
    flashButton(event.key);
  });

  window.addEventListener("resize", fitResult);
  render();
}

if (typeof document !== "undefined") {
  initUI();
}

// Permite testar a lógica no Node.js sem navegador.
if (typeof module !== "undefined" && module.exports) {
  module.exports = { Calculator, formatForDisplay, numberToString };
}
