const vscode = require('vscode');
  const path = require('path');
  const { createReactProject } = require('./frameworks/react');

  class Scaffolder {
      async createProject(options) {
          const { framework } = options;

          // Ensure project directory is unique
          const projectPath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, options.projectName);
          if (require('fs').existsSync(projectPath)) {
              throw new Error(`Directory ${options.projectName} already exists`);
          }

          // Dispatch to framework-specific scaffolder
          if (framework === 'react') {
              await createReactProject(projectPath, options);
          } else {
              throw new Error(`Unsupported framework: ${framework}`);
          }
      }
  }

  module.exports = Scaffolder;