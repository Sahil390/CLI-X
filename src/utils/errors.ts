// ============================================================
// CLI-X — Error Hierarchy
// All application errors extend AppError for typed catching.
// ============================================================

export class AppError extends Error {
  constructor(message: string, public readonly code = 'APP_ERROR') {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ToolError extends AppError {
  constructor(message: string, code = 'TOOL_ERROR') {
    super(message, code);
    this.name = 'ToolError';
  }
}

export class BuildError extends AppError {
  constructor(message: string, code = 'BUILD_ERROR') {
    super(message, code);
    this.name = 'BuildError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, code = 'VALIDATION_ERROR') {
    super(message, code);
    this.name = 'ValidationError';
  }
}

export class ModelError extends AppError {
  constructor(message: string, code = 'MODEL_ERROR') {
    super(message, code);
    this.name = 'ModelError';
  }
}

export class ProjectError extends AppError {
  constructor(message: string, code = 'PROJECT_ERROR') {
    super(message, code);
    this.name = 'ProjectError';
  }
}

export class DeploymentError extends AppError {
  constructor(message: string, code = 'DEPLOYMENT_ERROR') {
    super(message, code);
    this.name = 'DeploymentError';
  }
}

export class ConfigError extends AppError {
  constructor(message: string, code = 'CONFIG_ERROR') {
    super(message, code);
    this.name = 'ConfigError';
  }
}

export class NotImplementedError extends AppError {
  constructor(feature: string) {
    super(
      `${feature} is not implemented yet. This will be wired in Step 5 (external integrations).`,
      'NOT_IMPLEMENTED'
    );
    this.name = 'NotImplementedError';
  }
}

export class PortConflictError extends AppError {
  constructor(public readonly port: number) {
    super(`Port ${port} is already in use.`, 'PORT_CONFLICT');
    this.name = 'PortConflictError';
  }
}
