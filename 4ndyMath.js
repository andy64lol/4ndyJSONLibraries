// Name: 4ndyMath.js Ver: 3.5.0 (Browser Only)
// Made by 4ndy64 (Advanced Edition)
(() => {
  const _4ndyMath = {
    VERSION: '3.5.0',
    _cache: new Map(),

    // Built-in functions and their derivative rules
    _functions: {
      sin: { fn: Math.sin, d: (u, du) => ({ type: 'operator', op: '*', left: { type: 'function', name: 'cos', arg: u }, right: du }) },
      cos: { fn: Math.cos, d: (u, du) => ({
        type: 'operator', op: '*',
        left: { type: 'operator', op: '*', left: { type: 'number', value: -1 }, right: { type: 'function', name: 'sin', arg: u } },
        right: du 
      }) },
      tan: { fn: Math.tan, d: (u, du) => ({
        type: 'operator', op: '*',
        left: { type: 'operator', op: '^', left: { type: 'function', name: 'sec', arg: u }, right: { type: 'number', value: 2 } },
        right: du
      }) },
      ln: { fn: Math.log, d: (u, du) => ({
        type: 'operator', op: '/', left: du, right: u
      }) },
      log: { fn: (x) => Math.log10(x), d: (u, du) => ({
        type: 'operator', op: '/', left: du, 
        right: { type: 'operator', op: '*', left: u, right: { type: 'number', value: Math.LN10 } }
      }) },
      sqrt: { fn: Math.sqrt, d: (u, du) => ({
        type: 'operator', op: '/', 
        left: du, 
        right: { type: 'operator', op: '*', left: { type: 'number', value: 2 }, right: { type: 'function', name: 'sqrt', arg: u } }
      }) },
      exp: { fn: Math.exp, d: (u, du) => ({
        type: 'operator', op: '*', left: { type: 'function', name: 'exp', arg: u }, right: du
      }) },
      // sec(x)=1/cos(x) defined for differentiation purposes only
      sec: { fn: (x) => 1/Math.cos(x), d: (u, du) => ({
        type: 'operator', op: '*',
        left: { type: 'operator', op: '*', left: { type: 'number', value: 1 }, right: { type: 'function', name: 'tan', arg: u } },
        right: { type: 'operator', op: '^', left: { type: 'function', name: 'sec', arg: u }, right: { type: 'number', value: 2 } }
      }) }
    },

    // Core validation and error handling
    _validate: {
      input: (expr) => {
        if (typeof expr !== 'string') throw new Error('Input must be a string');
        // Allow letters, numbers, whitespace and math symbols including comma for function args.
        if (expr.match(/[^a-z0-9\s+\-*/·×÷^(),.=]/gi)) throw new Error('Invalid characters in expression');
      },
      division: (n) => {
        if (n === 0) throw new Error('Division by zero');
      }
    },

    // Operator configuration
    _ops: {
      precedence: {
        '+': 2, '-': 2,
        '*': 3, '·': 3, '×': 3,
        '/': 3, '÷': 3,
        '^': 4
      },
      associativity: {
        '^': 'right',
        '*': 'left', '·': 'left', '×': 'left',
        '/': 'left', '÷': 'left',
        '+': 'left', '-': 'left'
      }
    },

    // Tokenizer: identifies numbers, variables, operators, parentheses, commas, and functions
    tokenize: function(expr) {
      this._validate.input(expr);
      // Regex: numbers, words, operators, parentheses, commas, equals sign.
      const tokenRegex = /(\d+\.?\d*|\.\d+)|([a-zA-Z_πφ]+)|([+\-*/·×÷^(),=])/g;
      const tokens = [];
      let match;
      while ((match = tokenRegex.exec(expr)) !== null) {
        if (match[1]) {
          tokens.push({ type: 'number', value: parseFloat(match[1]) });
        } else if (match[2]) {
          // Check if token is a known function name
          const lowerVal = match[2].toLowerCase();
          if (this._functions.hasOwnProperty(lowerVal)) {
            tokens.push({ type: 'function', value: lowerVal });
          } else {
            tokens.push({ type: 'variable', value: match[2] });
          }
        } else if (match[3]) {
          const char = match[3];
          if (char === ',') {
            tokens.push({ type: 'comma', value: char });
          } else {
            tokens.push({ type: 'operator', value: char });
          }
        }
      }
      return this._addImplicitMultiplication(tokens);
    },

    // Handle implicit multiplication cases (e.g., 2x, 3(4+5), π(2+3))
    _addImplicitMultiplication: (tokens) => {
      const processed = [];
      for (let i = 0; i < tokens.length; i++) {
        processed.push(tokens[i]);
        const current = tokens[i];
        const next = tokens[i + 1];
        if (next && (
            // number followed by variable, function, or open parenthesis
            (current.type === 'number' && (next.type === 'variable' || next.type === 'function' || next.value === '(')) ||
            // variable or closing parenthesis followed by number, variable, function, or open parenthesis
            ((current.type === 'variable' || current.value === ')') && (next.type === 'number' || next.type === 'variable' || next.type === 'function' || next.value === '('))
          )) {
          processed.push({ type: 'operator', value: '·' });
        }
      }
      return processed;
    },

    // Shunting-yard algorithm implementation
    parseToRPN: function(tokens) {
      const output = [];
      const stack = [];
      tokens.forEach(token => {
        if (token.type === 'number' || token.type === 'variable') {
          output.push(token);
        } else if (token.type === 'function') {
          stack.push(token);
        } else if (token.value === ',') {
          // Until the token at the top is a left parenthesis, pop operators to output.
          while (stack.length && stack[stack.length - 1].value !== '(') {
            output.push(stack.pop());
          }
          if (!stack.length) {
            throw new Error("Misplaced comma or mismatched parentheses");
          }
        } else if (token.value === '(') {
          stack.push(token);
        } else if (token.value === ')') {
          while (stack.length && stack[stack.length - 1].value !== '(') {
            output.push(stack.pop());
          }
          if (!stack.length) throw new Error("Mismatched parentheses");
          stack.pop();
          // If the token at the top of the stack is a function, pop it onto the output.
          if (stack.length && stack[stack.length - 1].type === 'function') {
            output.push(stack.pop());
          }
        } else if (token.type === 'operator') {
          while (stack.length && stack[stack.length - 1].value !== '(' &&
            ((this._ops.precedence[token.value] < this._ops.precedence[stack[stack.length - 1].value]) ||
            (this._ops.precedence[token.value] === this._ops.precedence[stack[stack.length - 1].value] &&
             this._ops.associativity[token.value] === 'left'))) {
            output.push(stack.pop());
          }
          stack.push(token);
        }
      });
      while (stack.length) {
        const op = stack.pop();
        if (op.value === '(' || op.value === ')') throw new Error("Mismatched parentheses");
        output.push(op);
      }
      return output;
    },

    // Evaluate an RPN expression with variable and function support
    _evaluateRPN_withVariables: function(rpn, variables) {
      const stack = [];
      rpn.forEach(token => {
        if (token.type === 'number') {
          stack.push(token.value);
        } else if (token.type === 'variable') {
          if (variables.hasOwnProperty(token.value)) {
            stack.push(variables[token.value]);
          } else {
            throw new Error(`Variable ${token.value} not defined`);
          }
        } else if (token.type === 'function') {
          // Assume one-argument functions for now
          const arg = stack.pop();
          stack.push(this._functions[token.value].fn(arg));
        } else if (token.type === 'operator') {
          const b = stack.pop();
          const a = stack.pop();
          stack.push(this._performOperation(token.value, a, b));
        }
      });
      if (stack.length !== 1) throw new Error('Invalid expression');
      return stack[0];
    },

    // Performs the operation on two operands
    _performOperation: (op, a, b) => {
      switch(op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': case '·': case '×': return a * b;
        case '/': case '÷': 
          _4ndyMath._validate.division(b);
          return a / b;
        case '^': return Math.pow(a, b);
        default: throw new Error(`Unknown operator: ${op}`);
      }
    },

    // Equation solver core: supports equations of the form "LHS = RHS" with variable "x"
    solve: function(equation) {
      const sides = equation.split('=');
      if (sides.length !== 2) throw new Error("Equation must contain one '=' sign");
      const [left, right] = sides.map(side => side.trim());
      const leftRPN = this.parseToRPN(this.tokenize(left));
      const rightRPN = this.parseToRPN(this.tokenize(right));
      const equationTree = this._buildEquationTree(leftRPN, rightRPN);
      return this._solveTree(equationTree);
    },

    // Build a simple equation tree f(x)=LHS-RHS by evaluating f(x) at multiple points
    _buildEquationTree: function(leftRPN, rightRPN) {
      const f = (x) => this._evaluateRPN_withVariables(leftRPN, { x }) - this._evaluateRPN_withVariables(rightRPN, { x });
      const f0 = f(0), f1 = f(1), f2 = f(2);
      const secondDiff = f2 - 2 * f1 + f0;
      if (Math.abs(secondDiff) < 1e-8) {
        return { type: 'linear', coefficients: { x: f1 - f0 }, constant: f0 };
      } else {
        const A = secondDiff / 2;
        const B = f1 - f0 - A;
        const C = f0;
        return { type: 'quadratic', a: A, b: B, c: C };
      }
    },

    // Solve the built equation tree
    _solveTree: function(tree) {
      switch(tree.type) {
        case 'linear': return this._solveLinear(tree);
        case 'quadratic': return this._solveQuadratic(tree);
        default: throw new Error('Unsolvable or unsupported equation type');
      }
    },

    // Linear equation solver: m*x + c = 0
    _solveLinear: (eq) => {
      const m = eq.coefficients.x;
      if (Math.abs(m) < 1e-8) {
        if (Math.abs(eq.constant) < 1e-8) return { x: 'All real numbers' };
        throw new Error('No solution exists');
      }
      return { x: -eq.constant / m };
    },

    // Quadratic equation solver: ax^2 + bx + c = 0
    _solveQuadratic: (eq) => {
      const { a, b, c } = eq;
      const disc = b**2 - 4 * a * c;
      if (disc < 0) return { roots: [] };
      if (Math.abs(disc) < 1e-8) return { root: -b / (2 * a) };
      return {
        root1: (-b + Math.sqrt(disc)) / (2 * a),
        root2: (-b - Math.sqrt(disc)) / (2 * a)
      };
    },

    // System of equations solver using Gaussian elimination (expects array of equations)
    _solveLinearSystem: (system) => {
      const matrix = system.map(eq => [
        ...Object.values(eq.coefficients),
        eq.constant
      ]);
      // Gaussian elimination
      for (let i = 0; i < matrix.length; i++) {
        let pivot = matrix[i][i];
        for (let j = i + 1; j < matrix.length; j++) {
          const factor = matrix[j][i] / pivot;
          for (let k = i; k < matrix[0].length; k++) {
            matrix[j][k] -= factor * matrix[i][k];
          }
        }
      }
      // Back substitution
      const solution = new Array(matrix.length);
      for (let i = matrix.length - 1; i >= 0; i--) {
        solution[i] = matrix[i][matrix[0].length - 1];
        for (let j = i + 1; j < matrix.length; j++) {
          solution[i] -= matrix[i][j] * solution[j];
        }
        solution[i] /= matrix[i][i];
      }
      return solution;
    },

    // Evaluate a mathematical expression with optional variable substitution
    evaluate: function(expr, variables = {}) {
      const cacheKey = `eval:${expr}:${JSON.stringify(variables)}`;
      if (this._cache.has(cacheKey)) return this._cache.get(cacheKey);
      const tokens = this.tokenize(expr);
      const rpn = this.parseToRPN(tokens);
      const result = this._evaluateRPN_withVariables(rpn, variables);
      this._cache.set(cacheKey, result);
      return result;
    },

    // --- Advanced Symbolic Differentiation and Expression Tree Building ---

    // Build an expression tree from RPN
    _buildExpressionTree: function(rpn) {
      const stack = [];
      rpn.forEach(token => {
        if (token.type === 'number' || token.type === 'variable') {
          stack.push({ type: token.type, value: token.value });
        } else if (token.type === 'function') {
          // Assume single-argument functions
          const arg = stack.pop();
          stack.push({ type: 'function', name: token.value, arg });
        } else if (token.type === 'operator') {
          const right = stack.pop();
          const left = stack.pop();
          stack.push({ type: 'operator', op: token.value, left, right });
        }
      });
      if (stack.length !== 1) throw new Error('Invalid expression tree');
      return stack[0];
    },

    // Symbolically differentiate an expression (as a string) with respect to a variable (default "x")
    differentiate: function(expr, variable = 'x') {
      const tokens = this.tokenize(expr);
      const rpn = this.parseToRPN(tokens);
      const tree = this._buildExpressionTree(rpn);
      const dTree = this._differentiateTree(tree, variable);
      return this._treeToString(dTree);
    },

    // Recursive differentiation of an expression tree
    _differentiateTree: function(node, variable) {
      // Constant: derivative is 0
      if (node.type === 'number') {
        return { type: 'number', value: 0 };
      }
      // Variable: derivative is 1 if matches, else 0
      if (node.type === 'variable') {
        return { type: 'number', value: node.value === variable ? 1 : 0 };
      }
      // Operator node
      if (node.type === 'operator') {
        const op = node.op;
        const u = node.left, v = node.right;
        const du = this._differentiateTree(u, variable);
        const dv = this._differentiateTree(v, variable);
        switch(op) {
          case '+': return { type: 'operator', op: '+', left: du, right: dv };
          case '-': return { type: 'operator', op: '-', left: du, right: dv };
          case '*': return {
            type: 'operator', op: '+',
            left: { type: 'operator', op: '*', left: du, right: v },
            right: { type: 'operator', op: '*', left: u, right: dv }
          };
          case '/': return {
            type: 'operator', op: '/',
            left: { type: 'operator', op: '-', 
                    left: { type: 'operator', op: '*', left: du, right: v },
                    right: { type: 'operator', op: '*', left: u, right: dv } },
            right: { type: 'operator', op: '^', left: v, right: { type: 'number', value: 2 } }
          };
          case '^':
            // Handle power rule: assume v is constant or u is constant for simplicity
            if (v.type === 'number') {
              // d/dx u^c = c*u^(c-1)*du
              return {
                type: 'operator', op: '*',
                left: { type: 'operator', op: '*', left: v, right: { type: 'operator', op: '^', left: u, right: { type: 'number', value: v.value - 1 } } },
                right: du
              };
            } else if (u.type === 'number') {
              // d/dx c^v = c^v * ln(c)*dv
              return {
                type: 'operator', op: '*',
                left: { type: 'operator', op: '^', left: u, right: v },
                right: { type: 'operator', op: '*', left: { type: 'function', name: 'ln', arg: u }, right: dv }
              };
            } else {
              // General: u^v * (v' ln(u) + v*u'/u)
              return {
                type: 'operator', op: '*',
                left: { type: 'operator', op: '^', left: u, right: v },
                right: {
                  type: 'operator', op: '+',
                  left: { type: 'operator', op: '*', left: dv, right: { type: 'function', name: 'ln', arg: u } },
                  right: { type: 'operator', op: '/', left: { type: 'operator', op: '*', left: v, right: du }, right: u }
                }
              };
            }
          default:
            throw new Error(`Unsupported operator for differentiation: ${op}`);
        }
      }
      // Function node
      if (node.type === 'function') {
        const func = node.name;
        const u = node.arg;
        const du = this._differentiateTree(u, variable);
        if (!this._functions.hasOwnProperty(func)) {
          throw new Error(`No derivative rule for function ${func}`);
        }
        // Use the derivative rule provided in _functions
        return this._functions[func].d(u, du);
      }
      throw new Error("Unknown node type in differentiation");
    },

    // Convert an expression tree back into a string (simple unparenthesized format)
    _treeToString: function(node) {
      if (node.type === 'number') return node.value.toString();
      if (node.type === 'variable') return node.value;
      if (node.type === 'operator') {
        return `(${this._treeToString(node.left)} ${node.op} ${this._treeToString(node.right)})`;
      }
      if (node.type === 'function') {
        return `${node.name}(${this._treeToString(node.arg)})`;
      }
      return '';
    }
  };

  // Attach to the global window object for browser use.
  window._4ndyMath = _4ndyMath;
})();
