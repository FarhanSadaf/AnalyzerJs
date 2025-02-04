# AnalyzerJs
Static code analysis tool for JavaScript that detects and analyzes:

- **Sensor Data Usage:** Tracks the creation and usage of sensor-related objects, methods, and properties.
- **External Data Sends:** Identifies points where data is sent to external systems (e.g., via WebSocket, XMLHttpRequest).
- **Def/Use Chains:** Tracks variable definitions and their uses to analyze data flow in the code.

## How It Works
### Sensor Data Usage:
- Detects the creation of sensor-related objects (e.g., `THREE.WebGLRenderer`).
- Tracks method calls (e.g., `xr.getController`) and property accesses (e.g., `matrixWorld.decompose`).

### External Data Sends:
- Identifies points where data is sent to external systems (e.g., `WebSocket.send`).

### Def/Use Chains:
- Tracks where variables are defined and used, providing insights into data flow.

### Configuration:
- Uses a `config.json` file to define sensor-related classes, methods, and external data senders to make it adaptable to different projects.


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


