const fs = require('fs');
  const path = require('path');
  const vscode = require('vscode');

  async function saveTemplate(templateName, options) {
      try {
          const templateDir = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, '.vscode', 'scaffolder-templates');
          if (!fs.existsSync(templateDir)) {
              fs.mkdirSync(templateDir, { recursive: true });
          }
          const templatePath = path.join(templateDir, `${templateName}.json`);
          fs.writeFileSync(templatePath, JSON.stringify(options, null, 2));
      } catch (error) {
          throw new Error(`Failed to save template: ${error.message}`);
      }
  }

  async function loadTemplates() {
      try {
          const templateDir = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, '.vscode', 'scaffolder-templates');
          if (!fs.existsSync(templateDir)) {
              return [];
          }
          const files = fs.readdirSync(templateDir).filter(f => f.endsWith('.json'));
          return files.map(file => {
              const content = fs.readFileSync(path.join(templateDir, file), 'utf8');
              return {
                  name: file.replace('.json', ''),
                  options: JSON.parse(content)
              };
          });
      } catch (error) {
          throw new Error(`Failed to load templates: ${error.message}`);
      }
  }

  module.exports = { saveTemplate, loadTemplates };