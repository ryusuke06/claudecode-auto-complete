import { AutoCompleter } from './autocomplete';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export class ClaudeCodeIntegration {
  private autoCompleter: AutoCompleter;
  private configPath: string;

  constructor() {
    this.autoCompleter = new AutoCompleter();
    this.configPath = path.join(os.homedir(), '.claude', 'autocomplete-config.json');
  }

  async setupIntegration(): Promise<void> {
    try {
      // Create .claude directory if it doesn't exist
      const claudeDir = path.dirname(this.configPath);
      if (!fs.existsSync(claudeDir)) {
        fs.mkdirSync(claudeDir, { recursive: true });
      }

      // Create default configuration
      const defaultConfig = {
        enabled: true,
        maxSuggestions: 10,
        fuzzyMatching: true,
        historySize: 2000,
        shortcuts: {
          'gst': 'git status',
          'gco': 'git checkout',
          'gp': 'git push',
          'gl': 'git log',
          'll': 'ls -la'
        }
      };

      fs.writeFileSync(this.configPath, JSON.stringify(defaultConfig, null, 2));
      console.log(`Configuration created at: ${this.configPath}`);

    } catch (error) {
      console.error('Error setting up integration:', error);
      throw error;
    }
  }

  async getConfig(): Promise<any> {
    try {
      if (!fs.existsSync(this.configPath)) {
        await this.setupIntegration();
      }

      const configContent = fs.readFileSync(this.configPath, 'utf-8');
      return JSON.parse(configContent);
    } catch (error) {
      console.error('Error loading configuration:', error);
      return {};
    }
  }

  async updateConfig(updates: any): Promise<void> {
    try {
      const currentConfig = await this.getConfig();
      const newConfig = { ...currentConfig, ...updates };
      
      fs.writeFileSync(this.configPath, JSON.stringify(newConfig, null, 2));
      console.log('Configuration updated successfully');
    } catch (error) {
      console.error('Error updating configuration:', error);
      throw error;
    }
  }

  async handleClaudeCommand(input: string): Promise<string[]> {
    const config = await this.getConfig();
    
    if (!config.enabled) {
      return [];
    }

    // Check for shortcuts first
    if (config.shortcuts && config.shortcuts[input]) {
      return [config.shortcuts[input]];
    }

    // Get completions from autocompleter
    const completions = await this.autoCompleter.getCompletions(input);
    
    // Apply max suggestions limit
    const maxSuggestions = config.maxSuggestions || 10;
    return completions.slice(0, maxSuggestions);
  }

  async recordCommand(command: string): Promise<void> {
    // Record the command in history for learning
    this.autoCompleter.addToHistory(command);
  }

  // Method to be called by Claude Code when user types !command
  static async getCompletions(input: string): Promise<string[]> {
    const integration = new ClaudeCodeIntegration();
    return integration.handleClaudeCommand(input);
  }

  // Method to record executed commands
  static async recordExecution(command: string): Promise<void> {
    const integration = new ClaudeCodeIntegration();
    await integration.recordCommand(command);
  }

  async removeIntegration(): Promise<void> {
    try {
      if (fs.existsSync(this.configPath)) {
        fs.unlinkSync(this.configPath);
        console.log(`Configuration file removed: ${this.configPath}`);
      } else {
        console.log('Configuration file not found');
      }
    } catch (error) {
      console.error('Error removing integration:', error);
      throw error;
    }
  }
}