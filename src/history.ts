import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export class HistoryManager {
  private historyPath: string;
  private bashHistoryPath: string;

  constructor(customHistoryPath?: string) {
    this.historyPath = customHistoryPath || path.join(os.homedir(), '.claude_code_history');
    this.bashHistoryPath = path.join(os.homedir(), '.bash_history');
  }

  async loadHistory(): Promise<string[]> {
    try {
      if (!fs.existsSync(this.historyPath)) {
        return [];
      }
      
      const content = fs.readFileSync(this.historyPath, 'utf-8');
      return content
        .split('\n')
        .filter(line => line.trim() !== '')
        .slice(-1000); // Keep last 1000 commands
    } catch (error) {
      console.error('Error loading history:', error);
      return [];
    }
  }

  async saveCommand(command: string): Promise<void> {
    try {
      const cleanCommand = command.trim();
      if (cleanCommand === '') return;

      fs.appendFileSync(this.historyPath, `${cleanCommand}\n`);
    } catch (error) {
      console.error('Error saving command to history:', error);
    }
  }

  async getBashHistory(): Promise<string[]> {
    try {
      if (!fs.existsSync(this.bashHistoryPath)) {
        return [];
      }
      
      const content = fs.readFileSync(this.bashHistoryPath, 'utf-8');
      return content
        .split('\n')
        .filter(line => line.trim() !== '')
        .slice(-500); // Keep last 500 bash commands
    } catch (error) {
      console.error('Error loading bash history:', error);
      return [];
    }
  }

  async getZshHistory(): Promise<string[]> {
    try {
      const zshHistoryPath = path.join(os.homedir(), '.zsh_history');
      if (!fs.existsSync(zshHistoryPath)) {
        return [];
      }
      
      const content = fs.readFileSync(zshHistoryPath, 'utf-8');
      return content
        .split('\n')
        .filter(line => line.trim() !== '')
        .map(line => {
          // Zsh history format: `: timestamp:duration;command`
          const match = line.match(/^: \d+:\d+;(.*)$/);
          return match ? match[1] : line;
        })
        .slice(-500);
    } catch (error) {
      console.error('Error loading zsh history:', error);
      return [];
    }
  }
}