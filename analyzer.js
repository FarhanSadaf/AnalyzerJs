const fs = require('fs');
const StaticCodeAnalyzer = require('./static-code-analyzer/StaticCodeAnalyzer');

function getVariableDefsAndUses(defUseChains, variableNames) {
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

    const analyzer = new StaticCodeAnalyzer('./config.json', jsCode);

    // Extract def/use chains
    const defUseChains = analyzer.extractDefUseChains();

    // Sensor-related variables to track
    const sensorVars = ['headPosition', 'headQuaternion', 'headEuler', 'controller1', 'controller2'];
    getVariableDefsAndUses(defUseChains, sensorVars);

    // External data send analysis
    const senderVariables = analyzer.extractSendVariables();
    console.log('Sender Variables:', senderVariables);

    const externalDataSendPoints = analyzer.extractExternalDataSendPoints();
    console.log('External Data Send Points:');
    externalDataSendPoints.forEach(point => {
        console.log(`- Line ${point.loc.start.line}: ${point.description}`);
    });

    // Extract sensor data usage points
    const sensorDataUsage = analyzer.extractSensorDataUsage();
    console.log('Sensor Data Usage Points:', JSON.stringify(sensorDataUsage, null, 2));
    console.log('Sensor Variables:', analyzer.sensorDataAnalyzer.sensorVariables);
}

main();