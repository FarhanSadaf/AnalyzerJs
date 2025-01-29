const acorn = require('acorn');
const walk = require('acorn-walk');

function extractDefUseChains(jsCode) {
    // Parse the JavaScript code into an abstract syntax tree (AST)
    const ast = acorn.parse(jsCode, {
        ecmaVersion: 2020, 
        sourceType: 'module', 
        locations: true, 
    });

    const defUseChains = {};

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
        }
    };

    // Traverse the AST using the `full` method
    walk.full(ast, (node) => {
        if (visitor[node.type]) {
            visitor[node.type](node);
        }
    });

    return defUseChains;
}

// Export the function for use in other modules
module.exports = { extractDefUseChains };