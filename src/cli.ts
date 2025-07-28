#!/usr/bin/env node

import { Command } from 'commander';
import { AutoCompleter } from './autocomplete';
import { ClaudeCodeIntegration } from './claude-integration';
import * as readline from 'readline';

const program = new Command();

program
  .name('cc-autocomplete')
  .description('Auto-completion for Claude Code bash commands')
  .version('1.0.0');

program
  .command('complete')
  .description('Get completions for a given input')
  .argument('<input>', 'Input string to complete')
  .action(async (input: string) => {
    try {
      const completions = await ClaudeCodeIntegration.getCompletions(input);
      console.log(JSON.stringify(completions));
    } catch (error) {
      console.error('Error getting completions:', error);
      // Fallback to basic autocompleter
      const autoCompleter = new AutoCompleter();
      const completions = await autoCompleter.getCompletions(input);
      console.log(JSON.stringify(completions));
    }
  });

program
  .command('interactive')
  .description('Start interactive completion mode')
  .action(async () => {
    const autoCompleter = new AutoCompleter();
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      completer: async (line: string) => {
        const completions = await autoCompleter.getCompletions(line);
        return [completions, line];
      }
    });

    console.log('Claude Code Auto-Complete Interactive Mode');
    console.log('Type your commands and press TAB for completions');
    console.log('Type "exit" to quit\n');

    const askQuestion = (): void => {
      rl.question('! ', (input) => {
        if (input.toLowerCase() === 'exit') {
          rl.close();
          return;
        }

        if (input.trim() !== '') {
          autoCompleter.addToHistory(input);
          console.log(`Command executed: ${input}`);
        }

        askQuestion();
      });
    };

    askQuestion();
  });

program
  .command('history')
  .description('Show command history')
  .action(async () => {
    const autoCompleter = new AutoCompleter();
    const history = autoCompleter.getHistory();
    console.log('Command History:');
    history.slice(-20).forEach((cmd, index) => {
      console.log(`${index + 1}: ${cmd}`);
    });
  });

program
  .command('install')
  .description('Install Claude Code integration')
  .action(async () => {
    console.log('Installing Claude Code auto-complete integration...');
    
    try {
      const integration = new ClaudeCodeIntegration();
      await integration.setupIntegration();
      
      console.log('\n✓ Configuration file created successfully!');
      console.log('\n=== Installation Instructions ===');
      console.log('1. Copy this tool to your PATH');
      console.log('2. Add the following to your shell profile (.bashrc, .zshrc):');
      console.log('   export CLAUDE_CODE_AUTOCOMPLETE="cc-autocomplete"');
      console.log('3. Restart your shell or run: source ~/.bashrc (or ~/.zshrc)');
      console.log('4. Use "cc-autocomplete interactive" for interactive mode');
      console.log('\n=== Usage ===');
      console.log('- cc-autocomplete complete "git st" # Get completions');
      console.log('- cc-autocomplete interactive       # Interactive mode');
      console.log('- cc-autocomplete history           # View history');
    } catch (error) {
      console.error('Installation failed:', error);
      process.exit(1);
    }
  });

program
  .command('uninstall')
  .description('Uninstall Claude Code integration')
  .action(async () => {
    console.log('Uninstalling Claude Code auto-complete integration...');
    
    try {
      const integration = new ClaudeCodeIntegration();
      await integration.removeIntegration();
      
      console.log('\n✓ Claude Code integration removed successfully!');
      console.log('\n=== Manual Cleanup Instructions ===');
      console.log('1. Remove the following line from your shell profile (.bashrc, .zshrc):');
      console.log('   export CLAUDE_CODE_AUTOCOMPLETE="cc-autocomplete"');
      console.log('2. To completely remove the global command, run:');
      console.log('   npm unlink cc-autocomplete');
      console.log('3. Restart your shell or run: source ~/.bashrc (or ~/.zshrc)');
    } catch (error) {
      console.error('Uninstallation failed:', error);
      process.exit(1);
    }
  });

if (require.main === module) {
  program.parse();
}