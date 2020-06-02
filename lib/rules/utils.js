const pragmaUtil = require('./pragma');
const componentRule=(context)=>{
    const createClass = pragmaUtil.getCreateClassFromContext(context);
    const pragma = pragmaUtil.getFromContext(context);    
    const sourceCode = context.getSourceCode();
    const utils = {

    /**
     * Check if the node is a React ES5 component
     *
     * @param {ASTNode} node The AST node being checked.
     * @returns {Boolean} True if the node is a React ES5 component, false if not
     */
    isES5Component: function(node) {
      if (!node.parent) {
        return false;
      }
      return new RegExp(`^(${pragma}\\.)?${createClass}$`).test(sourceCode.getText(node.parent.callee));
    },

    /**
     * Check if the node is a React ES6 component
     *
     * @param {ASTNode} node The AST node being checked.
     * @returns {Boolean} True if the node is a React ES6 component, false if not
     */
    isES6Component: function(node) {
      if (utils.isExplicitComponent(node)) {
        return true;
      }

      if (!node.superClass) {
        return false;
      }
      return new RegExp(`^(${pragma}\\.)?(Pure)?Component$`).test(sourceCode.getText(node.superClass));
    },

    /**
     * Check if the node is explicitly declared as a descendant of a React Component
     *
     * @param {ASTNode} node The AST node being checked (can be a ReturnStatement or an ArrowFunctionExpression).
     * @returns {Boolean} True if the node is explicitly declared as a descendant of a React Component, false if not
     */
    isExplicitComponent: function(node) {
      let comment;
      // Sometimes the passed node may not have been parsed yet by eslint, and this function call crashes.
      // Can be removed when eslint sets "parent" property for all nodes on initial AST traversal: https://github.com/eslint/eslint-scope/issues/27
      // eslint-disable-next-line no-warning-comments
      // FIXME: Remove try/catch when https://github.com/eslint/eslint-scope/issues/27 is implemented.
      try {
        comment = sourceCode.getJSDocComment(node);
      } catch (e) {
        comment = null;
      }

      if (comment === null) {
        return false;
      }

      const commentAst = doctrine.parse(comment.value, {
        unwrap: true,
        tags: ['extends', 'augments']
      });

      const relevantTags = commentAst.tags.filter(tag => tag.name === 'React.Component' || tag.name === 'React.PureComponent');

      return relevantTags.length > 0;
    },

    /**
     * Checks to see if our component extends React.PureComponent
     *
     * @param {ASTNode} node The AST node being checked.
     * @returns {Boolean} True if node extends React.PureComponent, false if not
     */
    isPureComponent: function (node) {
      if (node.superClass) {
        return new RegExp(`^(${pragma}\\.)?PureComponent$`).test(sourceCode.getText(node.superClass));
      }
      return false;
    },

    /**
     * Check if variable is destructured from pragma import
     *
     * @param {variable} String The variable name to check
     * @returns {Boolean} True if createElement is destructured from the pragma
     */
    isDestructuredFromPragmaImport: function(variable) {
      const variables = variableUtil.variablesInScope(context);
      const variableInScope = variableUtil.getVariable(variables, variable);
      if (variableInScope) {
        const map = variableInScope.scope.set;
        return map.has(pragma);
      }
      return false;
    },

    /**
     * Checks to see if node is called within createElement from pragma
     *
     * @param {ASTNode} node The AST node being checked.
     * @returns {Boolean} True if createElement called from pragma
     */
    isCreateElement: function(node) {
      const calledOnPragma = (
        node &&
        node.callee &&
        node.callee.object &&
        node.callee.object.name === pragma &&
        node.callee.property &&
        node.callee.property.name === 'createElement'
      );

      const calledDirectly = (
        node &&
        node.callee &&
        node.callee.name === 'createElement'
      );

      if (this.isDestructuredFromPragmaImport('createElement')) {
        return calledDirectly || calledOnPragma;
      }
      return calledOnPragma;
    },

    getReturnPropertyAndNode(ASTnode) {
      let property;
      let node = ASTnode;
      switch (node.type) {
        case 'ReturnStatement':
          property = 'argument';
          break;
        case 'ArrowFunctionExpression':
          property = 'body';
          if (node[property] && node[property].type === 'BlockStatement') {
            node = utils.findReturnStatement(node);
            property = 'argument';
          }
          break;
        default:
          node = utils.findReturnStatement(node);
          property = 'argument';
      }
      return {
        node: node,
        property: property
      };
    },

    /**
     * Check if the node is returning JSX
     *
     * @param {ASTNode} ASTnode The AST node being checked
     * @param {Boolean} strict If true, in a ternary condition the node must return JSX in both cases
     * @returns {Boolean} True if the node is returning JSX, false if not
     */
    isReturningJSX: function(ASTnode, strict) {
      const nodeAndProperty = utils.getReturnPropertyAndNode(ASTnode);
      const node = nodeAndProperty.node;
      const property = nodeAndProperty.property;

      if (!node) {
        return false;
      }

      const returnsConditionalJSXConsequent =
        node[property] &&
        node[property].type === 'ConditionalExpression' &&
        jsxUtil.isJSX(node[property].consequent)
      ;
      const returnsConditionalJSXAlternate =
        node[property] &&
        node[property].type === 'ConditionalExpression' &&
        jsxUtil.isJSX(node[property].alternate)
      ;
      const returnsConditionalJSX =
        strict ?
          (returnsConditionalJSXConsequent && returnsConditionalJSXAlternate) :
          (returnsConditionalJSXConsequent || returnsConditionalJSXAlternate);

      const returnsJSX =
        node[property] &&
        jsxUtil.isJSX(node[property])
      ;
      const returnsPragmaCreateElement = this.isCreateElement(node[property]);

      return Boolean(
        returnsConditionalJSX ||
        returnsJSX ||
        returnsPragmaCreateElement
      );
    },

    /**
     * Check if the node is returning null
     *
     * @param {ASTNode} ASTnode The AST node being checked
     * @returns {Boolean} True if the node is returning null, false if not
     */
    isReturningNull(ASTnode) {
      const nodeAndProperty = utils.getReturnPropertyAndNode(ASTnode);
      const property = nodeAndProperty.property;
      const node = nodeAndProperty.node;

      if (!node) {
        return false;
      }

      return node[property] && node[property].value === null;
    },

    /**
     * Check if the node is returning JSX or null
     *
     * @param {ASTNode} ASTnode The AST node being checked
     * @param {Boolean} strict If true, in a ternary condition the node must return JSX in both cases
     * @returns {Boolean} True if the node is returning JSX or null, false if not
     */
    isReturningJSXOrNull(ASTNode, strict) {
      return utils.isReturningJSX(ASTNode, strict) || utils.isReturningNull(ASTNode);
    },

    isPragmaComponentWrapper(node) {
      if (node.type !== 'CallExpression') {
        return false;
      }
      const propertyNames = ['forwardRef', 'memo'];
      const calleeObject = node.callee.object;
      if (calleeObject && node.callee.property) {
        return arrayIncludes(propertyNames, node.callee.property.name) && calleeObject.name === pragma;
      }
      return arrayIncludes(propertyNames, node.callee.name) && this.isDestructuredFromPragmaImport(node.callee.name);
    },

    /**
     * Find a return statment in the current node
     *
     * @param {ASTNode} ASTnode The AST node being checked
     */
    findReturnStatement: astUtil.findReturnStatement,

    /**
     * Get the parent component node from the current scope
     *
     * @returns {ASTNode} component node, null if we are not in a component
     */
    getParentComponent: function() {
      return (
        utils.getParentES6Component() ||
        utils.getParentES5Component() ||
        utils.getParentStatelessComponent()
      );
    },

    /**
     * Get the parent ES5 component node from the current scope
     *
     * @returns {ASTNode} component node, null if we are not in a component
     */
    getParentES5Component: function() {
      let scope = context.getScope();
      while (scope) {
        const node = scope.block && scope.block.parent && scope.block.parent.parent;
        if (node && utils.isES5Component(node)) {
          return node;
        }
        scope = scope.upper;
      }
      return null;
    },

    /**
     * Get the parent ES6 component node from the current scope
     *
     * @returns {ASTNode} component node, null if we are not in a component
     */
    getParentES6Component: function() {
      let scope = context.getScope();
      while (scope && scope.type !== 'class') {
        scope = scope.upper;
      }
      const node = scope && scope.block;
      if (!node || !utils.isES6Component(node)) {
        return null;
      }
      return node;
    },

    /**
     * Get the parent stateless component node from the current scope
     *
     * @returns {ASTNode} component node, null if we are not in a component
     */
    getParentStatelessComponent: function() {
      let scope = context.getScope();
      while (scope) {
        const node = scope.block;
        const isFunction = /Function/.test(node.type); // Functions
        const isArrowFunction = astUtil.isArrowFunction(node);
        const enclosingScope = isArrowFunction ? utils.getArrowFunctionScope(scope) : scope;
        const enclosingScopeParent = enclosingScope && enclosingScope.block.parent;
        const isClass = enclosingScope && astUtil.isClass(enclosingScope.block);
        const isMethod = enclosingScopeParent && enclosingScopeParent.type === 'MethodDefinition'; // Classes methods
        const isArgument = node.parent && node.parent.type === 'CallExpression'; // Arguments (callback, etc.)
        // Attribute Expressions inside JSX Elements (<button onClick={() => props.handleClick()}></button>)
        const isJSXExpressionContainer = node.parent && node.parent.type === 'JSXExpressionContainer';
        if (isFunction && node.parent && this.isPragmaComponentWrapper(node.parent)) {
          return node.parent;
        }
        // Stop moving up if we reach a class or an argument (like a callback)
        if (isClass || isArgument) {
          return null;
        }
        // Return the node if it is a function that is not a class method and is not inside a JSX Element
        if (isFunction && !isMethod && !isJSXExpressionContainer && utils.isReturningJSXOrNull(node)) {
          return node;
        }
        scope = scope.upper;
      }
      return null;
    },

    /**
     * Get an enclosing scope used to find `this` value by an arrow function
     * @param {Scope} scope Current scope
     * @returns {Scope} An enclosing scope used by an arrow function
     */
    getArrowFunctionScope(scope) {
      scope = scope.upper;
      while (scope) {
        if (astUtil.isFunction(scope.block) || astUtil.isClass(scope.block)) {
          return scope;
        }
        scope = scope.upper;
      }
      return null;
    },

    /**
     * Get the related component from a node
     *
     * @param {ASTNode} node The AST node being checked (must be a MemberExpression).
     * @returns {ASTNode} component node, null if we cannot find the component
     */
    getRelatedComponent: function(node) {
      let i;
      let j;
      let k;
      let l;
      let componentNode;
      // Get the component path
      const componentPath = [];
      while (node) {
        if (node.property && node.property.type === 'Identifier') {
          componentPath.push(node.property.name);
        }
        if (node.object && node.object.type === 'Identifier') {
          componentPath.push(node.object.name);
        }
        node = node.object;
      }
      componentPath.reverse();
      const componentName = componentPath.slice(0, componentPath.length - 1).join('.');

      // Find the variable in the current scope
      const variableName = componentPath.shift();
      if (!variableName) {
        return null;
      }
      let variableInScope;
      const variables = variableUtil.variablesInScope(context);
      for (i = 0, j = variables.length; i < j; i++) {
        if (variables[i].name === variableName) {
          variableInScope = variables[i];
          break;
        }
      }
      if (!variableInScope) {
        return null;
      }

      // Try to find the component using variable references
      const refs = variableInScope.references;
      let refId;
      for (i = 0, j = refs.length; i < j; i++) {
        refId = refs[i].identifier;
        if (refId.parent && refId.parent.type === 'MemberExpression') {
          refId = refId.parent;
        }
        if (sourceCode.getText(refId) !== componentName) {
          continue;
        }
        if (refId.type === 'MemberExpression') {
          componentNode = refId.parent.right;
        } else if (refId.parent && refId.parent.type === 'VariableDeclarator' && refId.parent.init.type !== 'Identifier') {
          componentNode = refId.parent.init;
        }
        break;
      }

      if (componentNode) {
        // Return the component
        return components.add(componentNode, 1);
      }

      // Try to find the component using variable declarations
      let defInScope;
      const defs = variableInScope.defs;
      for (i = 0, j = defs.length; i < j; i++) {
        if (defs[i].type === 'ClassName' || defs[i].type === 'FunctionName' || defs[i].type === 'Variable') {
          defInScope = defs[i];
          break;
        }
      }
      if (!defInScope || !defInScope.node) {
        return null;
      }
      componentNode = defInScope.node.init || defInScope.node;

      // Traverse the node properties to the component declaration
      for (i = 0, j = componentPath.length; i < j; i++) {
        if (!componentNode.properties) {
          continue;
        }
        for (k = 0, l = componentNode.properties.length; k < l; k++) {
          if (componentNode.properties[k].key && componentNode.properties[k].key.name === componentPath[i]) {
            componentNode = componentNode.properties[k];
            break;
          }
        }
        if (!componentNode || !componentNode.value) {
          return null;
        }
        componentNode = componentNode.value;
      }

      // Return the component
      return components.add(componentNode, 1);
    }
  }
}