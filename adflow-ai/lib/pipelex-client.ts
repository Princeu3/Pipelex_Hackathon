import { spawn } from 'child_process';
import path from 'path';
import type { PipelexExecutionResult } from '@/types/pipelex';

const PYTHON_PATH = '/opt/homebrew/bin/python3.11';
const SCRIPTS_DIR = path.join(process.cwd(), 'scripts');

export async function executePipelexWorkflow(
  workflowName: string,
  inputs: Record<string, any>
): Promise<PipelexExecutionResult> {
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const scriptPath = path.join(SCRIPTS_DIR, 'workflow_executor.py');

    const pythonProcess = spawn(PYTHON_PATH, [scriptPath]);

    let outputData = '';
    let errorData = '';

    // Send input data to Python script via stdin
    const inputJson = JSON.stringify({
      workflow_name: workflowName,
      inputs: inputs,
    });

    pythonProcess.stdin.write(inputJson);
    pythonProcess.stdin.end();

    // Collect output data
    pythonProcess.stdout.on('data', (data) => {
      outputData += data.toString();
    });

    // Collect error data
    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString();
    });

    // Handle process completion
    pythonProcess.on('close', (code) => {
      const executionTime = Date.now() - startTime;

      if (code !== 0) {
        resolve({
          success: false,
          output: null,
          error: errorData || `Process exited with code ${code}`,
          executionTime,
        });
        return;
      }

      try {
        const result = JSON.parse(outputData);
        resolve({
          success: result.success,
          output: result.data,
          error: result.error,
          executionTime,
        });
      } catch (error) {
        resolve({
          success: false,
          output: null,
          error: `Failed to parse output: ${error}`,
          executionTime,
        });
      }
    });

    // Handle errors
    pythonProcess.on('error', (error) => {
      resolve({
        success: false,
        output: null,
        error: `Failed to start Python process: ${error.message}`,
        executionTime: Date.now() - startTime,
      });
    });
  });
}
