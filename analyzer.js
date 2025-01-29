const fs = require('fs');
const { extractDefUseChains, extractExternalDataSendPoints } = require('./def-use-chains');

function getVariableDefsAndUses(jsCode, variableNames) {
    const defUseChains = extractDefUseChains(jsCode);

    const variableDefsAndUses = {};
    for (const varName of variableNames) {
        if (defUseChains[varName]) {
            variableDefsAndUses[varName] = defUseChains[varName];
        }
    }

    // Print results
    console.log('Variable Def/Use Chains:');
    for (const [varName, chains] of Object.entries(variableDefsAndUses)) {
        console.log(`Variable: ${varName}`);
        console.log(`  Definitions: ${JSON.stringify(chains.defs, null, 2)}`);
        console.log(`  Uses: ${JSON.stringify(chains.uses, null, 2)}`);
        console.log();
    }
}

// Main function to handle command-line arguments
function main() {
    const filePath = process.argv[2];
    if (!filePath) {
        console.error('Please provide the path to the JavaScript file to analyze.');
        process.exit(1);
    }

    // Load the JavaScript code from the specified file
    const jsCode = fs.readFileSync(filePath, 'utf-8');

    /*
    // Sensor-related variables to track
    const sensorVars = ['headPosition', 'headQuaternion', 'headEuler', 'controller1', 'controller2'];
    getVariableDefsAndUses(jsCode, sensorVars);
    */

    // Extract all the variable names
    const defUseChains = extractDefUseChains(jsCode);
    console.log(Object.keys(defUseChains));

    // External data send analysis
    const externalDataSendPoints = extractExternalDataSendPoints(jsCode);
    console.log('External Data Send Points:');
    externalDataSendPoints.forEach(point => {
        console.log(`- Line ${point.loc.start.line}: ${point.description}`);
    });
}

main();