const fs = require('fs');
const acorn = require('acorn');
const walk = require('acorn-walk');

// Load patterns from JSON file
const patterns = JSON.parse(fs.readFileSync('def-use-chains-patterns.json', 'utf-8'));

function extractDefUseChains(jsCode) {
    // Parse the JavaScript code into an abstract syntax tree (AST)
    const ast = acorn.parse(jsCode, {
        ecmaVersion: 2020, 
        sourceType: 'module', 
        locations: true, 
    });

    const defUseChains = {};
    const externalDataSendPoints = [];

    // Define a custom visitor for AST traversal
    const visitor = {
        Identifier(node) {
            // Identifier node represents a variable name, function name, or property name in the code
            // Track variable uses
            const varName = node.name;
            if (defUseChains[varName]) {
                defUseChains[varName].uses.push(node.loc);
            } else {
                defUseChains[varName] = { defs: [], uses: [node.loc] };
            }
        },

        VariableDeclarator(node) {
            // VariableDeclarator node represents the declaration of a variable in a const, let, or var statement
            // Track variable definitions
            const varName = node.id.name;
            if (defUseChains[varName]) {
                defUseChains[varName].defs.push(node.loc);
            } else {
                defUseChains[varName] = { defs: [node.loc], uses: [] };
            }
        },

        // Tracking external data send points
        CallExpression(node) {
            // CallExpression node represents a function or method call
            if (node.callee.type === 'MemberExpression') {
                const objectName = node.callee.object.name;
                const propertyName = node.callee.property.name;

                // Check against patterns for CallExpression
                patterns.CallExpression.forEach((pattern) => {
                    if (
                        (!pattern.objectName || pattern.objectName === objectName) &&
                        (!pattern.propertyName || pattern.propertyName === propertyName)
                    ) {
                        externalDataSendPoints.push({
                            loc: node.loc,
                            description: pattern.description,
                        });
                    }
                });
            }
        },

        AssignmentExpression(node) {
            // AssignmentExpression node represents an assignment operation (e.g., =, +=, -=)
            if (node.left.type === 'MemberExpression') {
                const objectName = node.left.object.name;
                const propertyName = node.left.property.name;

                patterns.AssignmentExpression.forEach((pattern) => {
                    if (
                        pattern.objectName === objectName &&
                        pattern.propertyName === propertyName
                    ) {
                        externalDataSendPoints.push({
                            loc: node.loc,
                            description: pattern.description,
                        });
                    }
                });
            }
        },
    };

    // Traverse the AST using the `full` method
    walk.full(ast, (node) => {
        if (visitor[node.type]) {
            visitor[node.type](node);
        }
    });

    return { defUseChains, externalDataSendPoints };
}

// Export the function for use in other modules
module.exports = { extractDefUseChains };