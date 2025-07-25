import { AutoCompleter } from '../autocomplete';

describe('AutoCompleter', () => {
  let autoCompleter: AutoCompleter;

  beforeEach(() => {
    autoCompleter = new AutoCompleter();
  });

  describe('getCompletions', () => {
    it('should return completions for partial commands', async () => {
      const completions = await autoCompleter.getCompletions('gi');
      expect(completions.some(completion => completion.startsWith('git'))).toBe(true);
    });

    it('should return git subcommand completions', async () => {
      const completions = await autoCompleter.getCompletions('git st');
      expect(completions.some(completion => completion.includes('git st'))).toBe(true);
    });

    it('should return file path completions', async () => {
      const completions = await autoCompleter.getCompletions('ls src/');
      expect(Array.isArray(completions)).toBe(true);
    });

    it('should return empty array for no matches', async () => {
      const completions = await autoCompleter.getCompletions('nonexistentcommand123');
      expect(completions).toEqual([]);
    });

    it('should handle empty input', async () => {
      const completions = await autoCompleter.getCompletions('');
      expect(Array.isArray(completions)).toBe(true);
    });
  });

  describe('addToHistory', () => {
    it('should add command to history', async () => {
      autoCompleter.addToHistory('git status');
      const completions = await autoCompleter.getCompletions('git status');
      expect(completions).toContain('git status');
    });

    it('should not add duplicate commands', () => {
      autoCompleter.addToHistory('git status');
      autoCompleter.addToHistory('git status');
      const history = autoCompleter.getHistory();
      expect(history.filter((cmd: string) => cmd === 'git status')).toHaveLength(1);
    });
  });

  describe('fuzzy matching', () => {
    it('should support fuzzy matching for commands', async () => {
      autoCompleter.addToHistory('git status');
      const completions = await autoCompleter.getCompletions('gst');
      expect(completions.some(completion => completion.includes('git status'))).toBe(true);
    });
  });
});