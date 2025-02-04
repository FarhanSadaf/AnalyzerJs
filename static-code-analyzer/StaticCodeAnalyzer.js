const acorn = require('acorn');
const DefUseChains = require('./DefUseChains');
const ExternalDataSends = require('./ExternalDataSends');
const SensorDataUsage = require('./SensorDataUsage');
const fs = require('fs');

class StaticCodeAnalyzer {
    constructor(configPath, jsCode) {
        // Load configuration from JSON file
        this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

        this.ast = acorn.parse(jsCode, {
            ecmaVersion: 2020,
            sourceType: 'module',
            locations: true,
        });

        this.externalDataSendsAnalyzer = new ExternalDataSends(this.config);
        this.sensorDataAnalyzer = new SensorDataUsage(this.config);
    }

    extractDefUseChains() {
        return DefUseChains.extract(this.ast);
    }

    extractSendVariables() {
        return this.externalDataSendsAnalyzer.findSenderVariables(this.ast);
    }
    
    extractExternalDataSendPoints() {
        return this.externalDataSendsAnalyzer.extract(this.ast);
    }
    
    extractSensorDataUsage() {
        return this.sensorDataAnalyzer.extract(this.ast);
    }
}

module.exports = StaticCodeAnalyzer;