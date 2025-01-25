# AnalyzerJS

A tool to analyze JavaScript code for sensor data usage. It extracts **def/use chains** and identifies **external data transmission points** in JavaScript code using static analysis.

---

## Features
- Extracts **definitions** and **uses** of variables.
- Identifies **external data transmission points** (e.g., `socket.send`, `fetch`, `axios.post`).
- Supports modern JavaScript syntax (ES6+).
- Configurable patterns for detecting data transmission methods.

---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/FarhanSadaf/AnalyzerJs.git
   cd analyzerjs
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

---

## Usage

### Analyze a JavaScript File
Run the analyzer script with the path to your JavaScript file:

```bash
npm start path/to/your/javascript/file.js
```

### Example Output
For a JavaScript file like this:

```javascript
const headPosition = new THREE.Vector3();
console.log(headPosition);
socket.send('Hello, server!');
```

The output will include:
- **Def/Use Chains**: Definitions and uses of variables.
- **External Data Send Points**: Locations where data is transmitted externally.

---

## Configuration

### Patterns for Data Transmission
The tool uses a JSON file (`def-use-chains-patterns.json`) to define patterns for detecting external data transmission methods. You can customize this file to add or modify patterns.


---

## Scripts

### Start the Analyzer
Run the following command:

```bash
npm start path/to/your/javascript/file.js
```

