// Type definitions for Pipelex Python integration

export interface PipelexExecutionResult {
  success: boolean;
  output: any;
  error?: string;
  executionTime: number;
}

export interface WorkflowExecutionRequest {
  workflowName: string;
  inputs: Record<string, any>;
}

export interface WorkflowExecutionResponse {
  success: boolean;
  data?: any;
  error?: string;
  executionTime?: number;
}
