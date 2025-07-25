import * as fs from 'fs';
import * as path from 'path';
import { HistoryManager } from './history';
import { CommandSuggestion } from './types';
import * as fuzzy from 'fuzzy';

export class AutoCompleter {
  private historyManager: HistoryManager;
  private commonCommands: string[];
  private gitSubcommands: string[];
  private npmSubcommands: string[];
  private history: string[] = [];

  constructor() {
    this.historyManager = new HistoryManager();
    this.commonCommands = [
      'cd', 'ls', 'pwd', 'mkdir', 'rmdir', 'rm', 'cp', 'mv', 'touch',
      'cat', 'less', 'more', 'head', 'tail', 'grep', 'find', 'which',
      'git', 'npm', 'node', 'yarn', 'pip', 'python', 'python3',
      'curl', 'wget', 'ssh', 'scp', 'rsync', 'tar', 'gzip', 'unzip',
      'ps', 'top', 'htop', 'kill', 'jobs', 'nohup', 'screen', 'tmux',
      'chmod', 'chown', 'sudo', 'su', 'whoami', 'id', 'groups'
    ];

    this.gitSubcommands = [
      'add', 'commit', 'push', 'pull', 'clone', 'status', 'log', 'diff',
      'branch', 'checkout', 'merge', 'rebase', 'reset', 'stash', 'tag',
      'remote', 'fetch', 'show', 'config', 'init'
    ];

    this.npmSubcommands = [
      'install', 'uninstall', 'update', 'run', 'start', 'test', 'build',
      'init', 'publish', 'version', 'audit', 'fund', 'list', 'outdated'
    ];

    this.loadHistories();
  }

  private async loadHistories(): Promise<void> {
    try {
      const [claudeHistory, bashHistory, zshHistory] = await Promise.all([
        this.historyManager.loadHistory(),
        this.historyManager.getBashHistory(),
        this.historyManager.getZshHistory()
      ]);

      this.history = [
        ...new Set([...claudeHistory, ...bashHistory, ...zshHistory])
      ].slice(-2000);
    } catch (error) {
      console.error('Error loading histories:', error);
    }
  }

  async getCompletions(input: string): Promise<string[]> {
    const trimmedInput = input.trim();
    
    if (trimmedInput === '') {
      return this.getRecentCommands();
    }

    const completions: string[] = [];
    const parts = trimmedInput.split(' ');
    const firstWord = parts[0];

    // Command completion
    if (parts.length === 1) {
      completions.push(...this.getCommandCompletions(trimmedInput));
    }
    // Subcommand completion
    else if (parts.length === 2) {
      completions.push(...this.getSubcommandCompletions(firstWord, parts[1]));
    }
    // File/path completion
    else {
      completions.push(...await this.getPathCompletions(trimmedInput));
    }

    // History-based completions
    completions.push(...this.getHistoryCompletions(trimmedInput));

    // Remove duplicates and sort by relevance
    const uniqueCompletions = [...new Set(completions)];
    return this.rankCompletions(uniqueCompletions, trimmedInput);
  }

  private getCommandCompletions(input: string): string[] {
    const results = fuzzy.filter(input, this.commonCommands);
    return results.map(result => result.original);
  }

  private getSubcommandCompletions(command: string, subcommand: string): string[] {
    let subcommands: string[] = [];
    
    switch (command) {
      case 'git':
        subcommands = this.gitSubcommands;
        break;
      case 'npm':
      case 'yarn':
        subcommands = this.npmSubcommands;
        break;
      default:
        return [];
    }

    const results = fuzzy.filter(subcommand, subcommands);
    return results.map(result => `${command} ${result.original}`);
  }

  private async getPathCompletions(input: string): Promise<string[]> {
    try {
      const lastSpaceIndex = input.lastIndexOf(' ');
      const pathPart = input.substring(lastSpaceIndex + 1);
      const commandPart = input.substring(0, lastSpaceIndex + 1);

      const dirPath = path.dirname(pathPart) || '.';
      const basename = path.basename(pathPart);

      if (!fs.existsSync(dirPath)) {
        return [];
      }

      const files = fs.readdirSync(dirPath);
      const matches = files.filter(file => 
        file.toLowerCase().startsWith(basename.toLowerCase())
      );

      return matches.map(match => {
        const fullPath = path.join(dirPath, match);
        const isDir = fs.statSync(fullPath).isDirectory();
        return `${commandPart}${fullPath}${isDir ? '/' : ''}`;
      });
    } catch (error) {
      return [];
    }
  }

  private getHistoryCompletions(input: string): string[] {
    const results = fuzzy.filter(input, this.history);
    return results.map(result => result.original);
  }

  private getRecentCommands(): string[] {
    return this.history.slice(-20).reverse();
  }

  private rankCompletions(completions: string[], input: string): string[] {
    const suggestions: CommandSuggestion[] = completions.map(completion => ({
      command: completion,
      score: this.calculateScore(completion, input)
    }));

    return suggestions
      .sort((a, b) => b.score - a.score)
      .map(suggestion => suggestion.command)
      .slice(0, 10); // Return top 10 suggestions
  }

  private calculateScore(completion: string, input: string): number {
    let score = 0;
    
    // Exact prefix match gets highest score
    if (completion.toLowerCase().startsWith(input.toLowerCase())) {
      score += 100;
    }
    
    // Fuzzy match score
    const fuzzyResults = fuzzy.filter(input, [completion]);
    if (fuzzyResults.length > 0) {
      score += fuzzyResults[0].score || 0;
    }
    
    // Frequency in history
    const frequency = this.history.filter(cmd => cmd === completion).length;
    score += frequency * 10;
    
    // Common commands get slight boost
    if (this.commonCommands.includes(completion.split(' ')[0])) {
      score += 5;
    }

    return score;
  }

  addToHistory(command: string): void {
    const trimmedCommand = command.trim();
    if (trimmedCommand === '') return;

    // Remove duplicate if exists
    const index = this.history.indexOf(trimmedCommand);
    if (index !== -1) {
      this.history.splice(index, 1);
    }

    // Add to end
    this.history.push(trimmedCommand);
    
    // Keep only last 2000 commands
    this.history = this.history.slice(-2000);

    // Save to file
    this.historyManager.saveCommand(trimmedCommand);
  }

  getHistory(): string[] {
    return [...this.history];
  }
}