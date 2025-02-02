const walk = require('acorn-walk');

class DefUseChains {
    static extract(ast) {
        const defUseChains = {};

        // Define a custom visitor for AST traversal
        const visitor = {
            Identifier(node) {
                // Track variable uses
                const varName = node.name;
                if (defUseChains[varName]) {
                    defUseChains[varName].uses.push(node.loc);
                } else {
                    defUseChains[varName] = { defs: [], uses: [node.loc] };
                }
            },

            VariableDeclarator(node) {
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
}

module.exports = DefUseChains;