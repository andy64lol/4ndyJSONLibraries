// Name: 4ndyMath.js Ver: 3.5.0 (Browser Only)
// Made by 4ndy64 (Advanced Edition)
(() => {
  const _4ndyMath = {
    VERSION: '3.5.0',
    _cache: new Map(),
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
      sec: { fn: (x) => 1/Math.cos(x), d: (u, du) => ({
        type: 'operator', op: '*',
        left: {
          type: 'operator', op: '*',
          left: { type: 'function', name: 'sec', arg: u },
          right: { type: 'function', name: 'tan', arg: u }
        },
        right: du
      }) }
    },

    _validate: {
      input: (expr) => {
        if (typeof expr !== 'string') throw new Error('Input must be a string');
        if (expr.match(/[^a-z0-9\s+\-*/·×÷^(),.]/gi)) throw new Error('Invalid characters in expression');
      },
      division: (n) => {
        if (n === 0) throw new Error('Division by zero');
      }
    },

    tokenize: function(expr) {
      this._validate.input(expr);
      const tokenRegex = /(\d+\.?\d*|\.\d+)|([a-zA-Z_πφ]+)|([+\-*/·×÷^(),=])/g;
      const tokens = [];
      let match;
      while ((match = tokenRegex.exec(expr)) !== null) {
        if (match[1]) {
          tokens.push({ type: 'number', value: parseFloat(match[1]) });
        } else if (match[2]) {
          tokens.push({ type: 'variable', value: match[2] });
        } else if (match[3]) {
          const char = match[3];
          if (char === ',') {
            tokens.push({ type: 'comma', value: char });
          } else {
            tokens.push({ type: 'operator', value: char });
          }
        }
      }
      for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].type === 'variable' && this._functions[tokens[i].value.toLowerCase()]) {
          if (i + 1 < tokens.length && tokens[i + 1].type === 'operator' && tokens[i + 1].value === '(') {
            tokens[i].type = 'function';
            tokens[i].value = tokens[i].value.toLowerCase();
          }
        }
      }
      return this._addImplicitMultiplication(tokens);
    },
    
    _solveLinearSystem: (system) => {
      const matrix = system.map(eq => [...Object.values(eq.coefficients), eq.constant]);
      const n = matrix.length;
      for (let i = 0; i < n; i++) {
        let maxRow = i;
        for (let j = i + 1; j < n; j++) {
          if (Math.abs(matrix[j][i]) > Math.abs(matrix[maxRow][i])) {
            maxRow = j;
          }
        }
        [matrix[i], matrix[maxRow]] = [matrix[maxRow], matrix[i]];
        const pivot = matrix[i][i];
        if (Math.abs(pivot) < 1e-8) throw new Error('Matrix is singular');
        for (let j = i + 1; j < n; j++) {
          const factor = matrix[j][i] / pivot;
          for (let k = i; k < n + 1; k++) {
            matrix[j][k] -= factor * matrix[i][k];
          }
        }
      }
      const solution = new Array(n);
      for (let i = n - 1; i >= 0; i--) {
        solution[i] = matrix[i][n];
        for (let j = i + 1; j < n; j++) {
          solution[i] -= matrix[i][j] * solution[j];
        }
        solution[i] /= matrix[i][i];
      }
      return solution;
    },

    evaluate: function(expr, variables = {}) {
      const cacheKey = `eval:${expr}:${JSON.stringify(variables)}`;
      if (this._cache.has(cacheKey)) return this._cache.get(cacheKey);
      const tokens = this.tokenize(expr);
      const rpn = this.parseToRPN(tokens);
      const result = this._evaluateRPN_withVariables(rpn, variables);
      this._cache.set(cacheKey, result);
      return result;
    },

    _buildExpressionTree: function(rpn) {
      const stack = [];
      rpn.forEach(token => {
        if (token.type === 'number' || token.type === 'variable') {
          stack.push({ type: token.type, value: token.value });
        } else if (token.type === 'function') {
       
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

    differentiate: function(expr, variable = 'x') {
      const tokens = this.tokenize(expr);
      const rpn = this.parseToRPN(tokens);
      const tree = this._buildExpressionTree(rpn);
      const dTree = this._differentiateTree(tree, variable);
      return this._treeToString(dTree);
    },

    _differentiateTree: function(node, variable) {
      // Constant: derivative is 0
      if (node.type === 'number') {
        return { type: 'number', value: 0 };
      }
      // Variable: derivative is 1 if matches, else 0
      if (node.type === 'variable') {
        return { type: 'number', value: node.value === variable ? 1 : 0 };
      }
      
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
      
      if (node.type === 'function') {
        const func = node.name;
        const u = node.arg;
        const du = this._differentiateTree(u, variable);
        if (!this._functions.hasOwnProperty(func)) {
          throw new Error(`No derivative rule for function ${func}`);
        }
        
        return this._functions[func].d(u, du);
      }
      throw new Error("Unknown node type in differentiation");
    },

   
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

  window._4ndyMath = _4ndyMath;
})();
