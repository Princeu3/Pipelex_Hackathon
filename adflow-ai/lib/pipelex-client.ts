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
        // Extract JSON from output (ignore warnings and other text)
        // Try multiple strategies to find valid JSON
        let result = null;
        
        // Strategy 1: Look for lines starting with { and ending with }
        const lines = outputData.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
            try {
              result = JSON.parse(trimmed);
              break;
            } catch {
              continue;
            }
          }
        }
        
        // Strategy 2: Find the last complete JSON object
        if (!result) {
          const matches = outputData.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g);
          if (matches && matches.length > 0) {
            // Try from the last match backwards (most likely to be our result)
            for (let i = matches.length - 1; i >= 0; i--) {
              try {
                result = JSON.parse(matches[i]);
                break;
              } catch {
                continue;
              }
            }
          }
        }
        
        // Strategy 3: Traditional first { to last }
        if (!result) {
          const firstBrace = outputData.indexOf('{');
          const lastBrace = outputData.lastIndexOf('}');
          
          if (firstBrace !== -1 && lastBrace !== -1) {
            const jsonString = outputData.substring(firstBrace, lastBrace + 1);
            result = JSON.parse(jsonString);
          }
        }

        if (!result) {
          throw new Error('No valid JSON object found in output');
        }

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
          error: `Failed to parse output: ${error}. Raw output: ${outputData.substring(0, 500)}`,
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
