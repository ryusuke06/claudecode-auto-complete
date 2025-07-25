# 貢献ガイド

Claude Code Auto-Completeプロジェクトへの貢献をありがとうございます！

## 開発環境のセットアップ

1. リポジトリをフォーク
2. ローカルにクローン
```bash
git clone https://github.com/your-username/claudecode-auto-complete.git
cd claudecode-auto-complete
```

3. 依存関係をインストール
```bash
npm install
```

4. 開発ブランチを作成
```bash
git checkout -b feature/your-feature-name
```

## 開発フロー

### テスト駆動開発 (TDD)

このプロジェクトはTDDを採用しています：

1. **テストファースト**: 新機能の実装前にテストを作成
2. **Red-Green-Refactor**: テスト失敗 → 実装 → リファクタリング
3. **テスト実行**: `npm test` でテストを実行

### コード品質

```bash
# 型チェック
npm run typecheck

# リンター
npm run lint

# テスト
npm test

# ビルド
npm run build
```

## プルリクエストガイドライン

1. **機能ブランチ**: `feature/`, `fix/`, `docs/` プレフィックスを使用
2. **テストの追加**: 新機能には必ずテストを含める
3. **ドキュメント更新**: APIの変更時はREADMEも更新
4. **コミットメッセージ**: 明確で説明的なメッセージを記述

### コミットメッセージ形式

```
type(scope): description

- feat: 新機能
- fix: バグ修正  
- docs: ドキュメント
- test: テスト
- refactor: リファクタリング
```

## イシューガイドライン

### バグレポート

- OS、Nodeバージョンを記載
- 再現手順を詳細に説明
- 期待される動作と実際の動作を明記

### 機能リクエスト

- 使用ケースを説明
- 既存の代替案との比較
- 実装の複雑さを考慮

## リリースプロセス

1. バージョン番号を更新
2. CHANGELOGを更新
3. テストとビルドが成功することを確認
4. リリースタグを作成

## ライセンス

貢献したコードはMITライセンスの下で公開されます。