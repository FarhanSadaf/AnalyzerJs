const fs = require('fs');
const { extractDefUseChains } = require('./def-use-chains');

function analyzeSensorDataUsage(jsCode, sensorVars) {
    // Extract def/use chains and external data send points
    const { defUseChains, externalDataSendPoints } = extractDefUseChains(jsCode);

    // Filter def/use chains for sensor-related variables
    const sensorDefUseChains = {};
    for (const varName of sensorVars) {
        if (defUseChains[varName]) {
            sensorDefUseChains[varName] = defUseChains[varName];
        }
    }

    // Print results
    console.log('Sensor Data Def/Use Chains:');
    for (const [varName, chains] of Object.entries(sensorDefUseChains)) {
        console.log(`Variable: ${varName}`);
        console.log(`  Definitions: ${JSON.stringify(chains.defs, null, 2)}`);
        console.log(`  Uses: ${JSON.stringify(chains.uses, null, 2)}`);
        console.log();
    }

    console.log('External Data Send Points:');
    for (const point of externalDataSendPoints) {
        console.log(`Line: ${JSON.stringify(point, null, 2)}`);
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

    // Sensor-related variables to track
    const sensorVars = ['headPosition', 'headQuaternion', 'headEuler', 'controller1', 'controller2'];

    analyzeSensorDataUsage(jsCode, sensorVars);
}

// Run the script
main();