import { HistoryManager } from '../history';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('HistoryManager', () => {
  let historyManager: HistoryManager;
  const testHistoryPath = '/tmp/test-history';

  beforeEach(() => {
    historyManager = new HistoryManager(testHistoryPath);
    jest.clearAllMocks();
  });

  describe('loadHistory', () => {
    it('should load history from file', async () => {
      const mockHistory = 'git status\nnpm install\nls -la\n';
      mockFs.readFileSync.mockReturnValue(mockHistory);
      mockFs.existsSync.mockReturnValue(true);

      const history = await historyManager.loadHistory();
      
      expect(history).toEqual(['git status', 'npm install', 'ls -la']);
    });

    it('should return empty array when history file does not exist', async () => {
      mockFs.existsSync.mockReturnValue(false);

      const history = await historyManager.loadHistory();
      
      expect(history).toEqual([]);
    });
  });

  describe('saveCommand', () => {
    it('should append command to history file', async () => {
      mockFs.existsSync.mockReturnValue(true);
      
      await historyManager.saveCommand('git commit -m "test"');
      
      expect(mockFs.appendFileSync).toHaveBeenCalledWith(
        testHistoryPath,
        'git commit -m "test"\n'
      );
    });
  });

  describe('getBashHistory', () => {
    it('should read bash history file', async () => {
      const mockHistory = 'cd ~\ngit clone repo\n';
      mockFs.readFileSync.mockReturnValue(mockHistory);
      mockFs.existsSync.mockReturnValue(true);

      const history = await historyManager.getBashHistory();
      
      expect(history).toEqual(['cd ~', 'git clone repo']);
    });
  });
});