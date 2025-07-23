const vscode = require('vscode');
  const Scaffolder = require('./src/scaffolder');
  const { loadTemplates, saveTemplate } = require('./src/utils/templates');

  /**
   * @param {vscode.ExtensionContext} context
   */
  async function activate(context) {
      console.log('VSCode Scaffolder is now active!');

      let disposable = vscode.commands.registerCommand('vscodeScaffolder.createProject', async () => {
          try {
              // Load saved templates
              const templates = await loadTemplates();
              const templateOptions = ['New Configuration', ...templates.map(t => t.name)];
              const selectedTemplate = await vscode.window.showQuickPick(templateOptions, {
                  placeHolder: 'Select a template or create a new configuration'
              });
              if (!selectedTemplate) return; // User cancelled

              let options = {};
              if (selectedTemplate !== 'New Configuration') {
                  options = templates.find(t => t.name === selectedTemplate).options;
              } else {
                  // Prompt for project name
                  const projectName = await vscode.window.showInputBox({
                      prompt: 'Enter project name',
                      placeHolder: 'my-app',
                      validateInput: (value) => {
                          if (!value || !/^[a-zA-Z0-9_-]+$/.test(value)) {
                              return 'Project name must be non-empty and contain only letters, numbers, hyphens, or underscores';
                          }
                          return null;
                      }
                  });
                  if (!projectName) return; // User cancelled

                  // Prompt for framework
                  const framework = await vscode.window.showQuickPick(['React', 'Vue'], {
                      placeHolder: 'Select framework'
                  });
                  if (!framework) return; // User cancelled

                  // Prompt for TypeScript
                  const useTypescript = await vscode.window.showQuickPick(['Yes', 'No'], {
                      placeHolder: 'Use TypeScript?'
                  });
                  if (!useTypescript) return; // User cancelled

                  // Prompt for Tailwind CSS
                  const useTailwind = await vscode.window.showQuickPick(['Yes', 'No'], {
                      placeHolder: 'Use Tailwind CSS?'
                  });
                  if (!useTailwind) return; // User cancelled

                  // Prompt for ESLint
                  const useEslint = await vscode.window.showQuickPick(['Yes', 'No'], {
                      placeHolder: 'Use ESLint?'
                  });
                  if (!useEslint) return; // User cancelled

                  // Prompt for Prettier
                  const usePrettier = await vscode.window.showQuickPick(['Yes', 'No'], {
                      placeHolder: 'Use Prettier?'
                  });
                  if (!usePrettier) return; // User cancelled

                  // Prompt for Router
                  const useRouter = await vscode.window.showQuickPick(['Yes', 'No'], {
                      placeHolder: `Use ${framework === 'React' ? 'React Router' : 'Vue Router'}?`
                  });
                  if (!useRouter) return; // User cancelled

                  // Prompt for package manager
                  const packageManager = await vscode.window.showQuickPick(['npm', 'yarn', 'pnpm'], {
                      placeHolder: 'Select package manager'
                  });
                  if (!packageManager) return; // User cancelled

                  // Create options object
                  options = {
                      projectName,
                      framework: framework.toLowerCase(),
                      useTypescript: useTypescript === 'Yes',
                      useTailwind: useTailwind === 'Yes',
                      useEslint: useEslint === 'Yes',
                      usePrettier: usePrettier === 'Yes',
                      useRouter: useRouter === 'Yes',
                      packageManager
                  };

                  // Prompt to save template
                  const saveAsTemplate = await vscode.window.showQuickPick(['Yes', 'No'], {
                      placeHolder: 'Save this configuration as a template?'
                  });
                  if (saveAsTemplate === 'Yes') {
                      const templateName = await vscode.window.showInputBox({
                          prompt: 'Enter template name',
                          placeHolder: 'my-template',
                          validateInput: (value) => {
                              if (!value || !/^[a-zA-Z0-9_-]+$/.test(value)) {
                                  return 'Template name must be non-empty and contain only letters, numbers, hyphens, or underscores';
                              }
                              if (templates.some(t => t.name === value)) {
                                  return 'Template name already exists';
                              }
                              return null;
                          }
                      });
                      if (templateName) {
                          await saveTemplate(templateName, options);
                          vscode.window.showInformationMessage(`Template ${templateName} saved successfully!`);
                      }
                  }
              }

              // Initialize scaffolder and create project
              const scaffolder = new Scaffolder();
              await scaffolder.createProject(options);

              vscode.window.showInformationMessage(`Project ${options.projectName} created successfully!`);
          } catch (error) {
              vscode.window.showErrorMessage(`Failed to create project: ${error.message}`);
          }
      });

      context.subscriptions.push(disposable);
  }

  function deactivate() {}

  module.exports = {
      activate,
      deactivate
  };