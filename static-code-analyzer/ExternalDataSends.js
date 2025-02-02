const walk = require('acorn-walk');

class ExternalDataSends {
    constructor(config) {
        this.SENDER_CLASSES_REGEX = new RegExp(`\\b(${config.senderClasses.join('|')})\\b`);
        this.SENDER_METHODS_REGEX = new RegExp(`^(${config.senderMethods.join('|')})$`, 'i');
    }

    findSenderVariables(ast) {
        const senderVariables = {};

        walk.full(ast, (node) => {
            if (node.type === 'VariableDeclarator' && node.init && node.init.type === 'NewExpression') {
                const callee = node.init.callee;
                if (callee.type === 'Identifier' && this.SENDER_CLASSES_REGEX.test(callee.name)) {
                    const varName = node.id.name;
                    senderVariables[varName] = callee.name;
                }
            }
        });

        return senderVariables;
    }

    extract(ast) {
        const senderVariables = this.findSenderVariables(ast);
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

                        if (senderVariables[varName] && this.SENDER_METHODS_REGEX.test(methodName)) {
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
}

module.exports = ExternalDataSends;