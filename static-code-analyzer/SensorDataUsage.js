const walk = require('acorn-walk');

class SensorDataUsage {
  constructor(config) {
    this.sensorConfig = config.sensorClasses; 
    this.sensorVariables = new Set(); 
    this.sensorUsagePoints = []; 
  }

  extract(ast) {
    this.sensorVariables.clear();
    this.sensorUsagePoints = [];

    walk.fullAncestor(ast, (node, ancestors) => {
      if (node.type === 'VariableDeclarator' && node.init?.type === 'NewExpression') {
        const className = this.getClassName(node.init.callee);
        if (this.sensorConfig[className]) {
          this.sensorVariables.add(node.id.name);
          this.sensorUsagePoints.push({
            type: 'object_creation',
            variable: node.id.name,
            className,
            loc: node.loc,
          });
        }
      }

      // Detect method calls (e.g. renderer.xr.getController())
      if (node.type === 'CallExpression' && node.callee.type === 'MemberExpression') {
        const { object, methodChain } = this.unwrapCall(node.callee);

        if (object && this.sensorVariables.has(object)) {
          const expectedMethods = this.getExpectedMethods(object);
          if (expectedMethods?.includes(methodChain)) {
            const targetVar = this.getAssignedVariable(node, ancestors);
            if (targetVar) {
              this.sensorVariables.add(targetVar);
            }

            this.sensorUsagePoints.push({
              type: 'method_call',
              variable: object,
              methodName: methodChain,
              loc: node.loc,
            });
          }
        }
      }

      // Detect property accesses (e.g. controller1.matrixWorld.decompose())
      if (node.type === 'MemberExpression') {
        const { object, propertyName } = this.unwrapPropertyAccess(node);

        if (object && this.sensorVariables.has(object)) {
          this.sensorUsagePoints.push({
            type: 'property_access',
            variable: object,
            propertyName,
            loc: node.loc,
          });
        }
      }
    });

    return this.sensorUsagePoints;
  }

  // Helper methods
  getClassName(callee) {
    const parts = [];
    let current = callee;
    while (current?.type === 'MemberExpression') {
      parts.unshift(current.property.name);
      current = current.object;
    }
    return current?.name + (parts.length ? `.${parts.join('.')}` : '');
  }

  unwrapCall(callee) {
    const parts = [];
    let object = null;
    let current = callee;

    while (current?.type === 'MemberExpression') {
      parts.unshift(current.property.name);
      if (current.object.type === 'Identifier') {
        object = current.object.name;
        break;
      }
      current = current.object;
    }

    return {
      object,
      methodChain: parts.join('.'),
    };
  }

  unwrapPropertyAccess(node) {
    const object = node.object?.name;
    const propertyName = node.property?.name;
    return { object, propertyName };
  }

  getAssignedVariable(node, ancestors) {
    // Check if the result of a method call is assigned to a variable
    const parent = ancestors[ancestors.length - 2]; // Get the parent node
    if (parent.type === 'VariableDeclarator') {
      return parent.id.name; // Variable assignment (e.g. const controller1 = ...)
    }
    if (parent.type === 'AssignmentExpression' && parent.left.type === 'Identifier') {
      return parent.left.name; // Assignment (e.g. controller1 = ...)
    }
    return null;
  }

  getExpectedMethods(variable) {
    for (const [className, methods] of Object.entries(this.sensorConfig)) {
      if (this.sensorVariables.has(variable)) {
        return methods;
      }
    }
    return null;
  }
}

module.exports = SensorDataUsage;