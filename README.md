# Claude Code Auto-Complete

Claude Code用のbashコマンド自動補完機能を提供するOSSライブラリです。

## 機能

- **インテリジェントな補完**: bash履歴とコマンドパターンに基づく賢い補完
- **ファジーマッチング**: 部分的な入力でもマッチするファジー検索
- **履歴学習**: 過去のコマンドから学習し、よく使用するコマンドを優先表示
- **パス補完**: ファイルとディレクトリの自動補完
- **Git統合**: Gitサブコマンドの専用補完
- **設定可能**: ユーザー設定とショートカットのカスタマイズ

## インストール

```bash
npm install -g claudecode-autocomplete
```

## 使用方法

### CLIコマンド

```bash
# 補完候補を取得
cc-autocomplete complete "git st"

# インタラクティブモード
cc-autocomplete interactive

# コマンド履歴を表示
cc-autocomplete history

# インストール手順を表示
cc-autocomplete install
```

### プログラム的使用

```typescript
import { AutoCompleter } from 'claudecode-autocomplete';

const autoCompleter = new AutoCompleter();

// 補完候補を取得
const completions = await autoCompleter.getCompletions('git st');
console.log(completions); // ['git status', 'git stash', ...]

// 履歴に追加
autoCompleter.addToHistory('git status');
```

## Claude Code統合

Claude Codeとの統合により、`!`コマンド入力時に自動的に補完候補が表示されます。

```typescript
import { ClaudeCodeIntegration } from 'claudecode-autocomplete';

// Claude Codeから呼び出される関数
const completions = await ClaudeCodeIntegration.getCompletions('git st');

// コマンド実行後の記録
await ClaudeCodeIntegration.recordExecution('git status');
```

## 設定

設定ファイルは `~/.claude/autocomplete-config.json` に保存されます：

```json
{
  "enabled": true,
  "maxSuggestions": 10,
  "fuzzyMatching": true,
  "historySize": 2000,
  "shortcuts": {
    "gst": "git status",
    "gco": "git checkout",
    "gp": "git push",
    "gl": "git log",
    "ll": "ls -la"
  }
}
```

## 開発

### セットアップ

```bash
git clone https://github.com/your-username/claudecode-auto-complete.git
cd claudecode-auto-complete
npm install
```

### テスト実行

```bash
npm test
```

### ビルド

```bash
npm run build
```

### 型チェック

```bash
npm run typecheck
```

## アーキテクチャ

### 主要コンポーネント

- **AutoCompleter**: メイン補完エンジン
- **HistoryManager**: コマンド履歴管理
- **ClaudeCodeIntegration**: Claude Code統合機能
- **CLI**: コマンドラインインターフェース

### 補完アルゴリズム

1. **コマンド補完**: 一般的なUnixコマンドの補完
2. **サブコマンド補完**: Git、NPMなどの専用サブコマンド
3. **パス補完**: ファイルシステムベースの補完
4. **履歴補完**: 過去のコマンド履歴からの補完
5. **スコアリング**: 関連性とフリクエンシーに基づくランキング

## ライセンス

MIT License

## 貢献

プルリクエストやイシューの報告を歓迎します。

## サポート

- GitHub Issues: [問題報告](https://github.com/your-username/claudecode-auto-complete/issues)
- 機能リクエスト: [新機能提案](https://github.com/your-username/claudecode-auto-complete/discussions)