const fs = require('fs');
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

// Regex patterns to identify sender classes and methods
const SENDER_CLASSES_REGEX = /\b(WebSocket|XMLHttpRequest|RTCPeerConnection|EventSource|Worker|WebRTC)\b/;
const SENDER_METHODS_REGEX = /^(send|post|postMessage|createOffer|createAnswer|open)$/i;

function findSenderVariables(ast) {
    const senderVariables = {};

    walk.full(ast, (node) => {
        if (node.type === 'VariableDeclarator' && node.init && node.init.type === 'NewExpression') {
            const callee = node.init.callee;
            if (callee.type === 'Identifier' && SENDER_CLASSES_REGEX.test(callee.name)) {
                const varName = node.id.name;
                senderVariables[varName] = callee.name;
            }
        }
    });

    return senderVariables;
}

function extractExternalDataSendPoints(jsCode) {
    const ast = acorn.parse(jsCode, {
        ecmaVersion: 2020,
        sourceType: 'module',
        locations: true,
    });

    const senderVariables = findSenderVariables(ast);
    const externalDataSendPoints = [];

    walk.full(ast, (node) => {
        if (node.type === 'CallExpression') {
            const callee = node.callee;
            if (callee.type === 'MemberExpression') {
                const object = callee.object;
                const property = callee.property;

                if (object.type === 'Identifier' && property.type === 'Identifier') {
                    const varName = object.name;
                    const methodName = property.name;

                    if (senderVariables[varName] && SENDER_METHODS_REGEX.test(methodName)) {
                        externalDataSendPoints.push({
                            loc: node.loc,
                            description: `Data sent via ${senderVariables[varName]} method '${methodName}'`
                        });
                    }
                }
            }
        }
    });

    return externalDataSendPoints;
}

// Export the function for use in other modules
module.exports = { extractDefUseChains, extractExternalDataSendPoints };