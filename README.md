# meshi-search-v0.1

AI搭載の飲食店検索・予約代行サービス

## 概要

飲食店予約の手間を大幅に削減するWebサービス。条件を入力するだけで、AIが最適な店を提案し、予約代行まで行います。

## 技術スタック

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4
- **店舗情報**: Google Places API
- **Hosting**: Vercel

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local.example`をコピーして`.env.local`を作成：

```bash
cp .env.local.example .env.local
```

以下の環境変数を設定：

```env
# Supabase (任意)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI (任意 - AI推奨理由の改善用)
OPENAI_API_KEY=your_openai_api_key

# Google Places API (任意 - 実店舗データ取得用)
GOOGLE_PLACES_API_KEY=your_google_places_api_key
```

**注意**: APIキーがなくてもモックデータで動作します。

### 3. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアクセス可能

## 機能

- 3ステップの簡単検索フォーム
- AI/Google Places APIによる店舗推奨
- レスポンシブデザイン
- 予約リクエスト機能（開発中）

## 動作モード

本サービスは設定されたAPIキーに応じて3つのモードで動作します：

### 1. デモモード（APIキーなし）
- **動作**: モックデータで3店舗を表示
- **用途**: UIの確認、デモンストレーション
- **特徴**: APIコストなし、即座に動作確認可能

### 2. 実店舗検索モード（Google Places APIキーのみ）
- **動作**: Google Places APIから実際の店舗データを取得
- **取得情報**: 
  - 店名、住所、電話番号
  - Google評価（★スコア）
  - 営業時間、価格帯
  - 公式ウェブサイト
- **検索範囲**: 指定エリアから半径2km以内
- **フィルタリング**: 予算に応じた価格帯で絞り込み

### 3. AI強化モード（両方のAPIキーあり）
- **動作**: Google Places APIで取得した店舗情報をOpenAI GPT-4で分析
- **AI機能**:
  - ユーザーの条件（人数、目的、予算等）に基づく推奨理由の生成
  - より具体的で魅力的な店舗説明
  - 検索条件との適合性を考慮した提案
- **メリット**: パーソナライズされた提案で満足度向上

### APIキー設定と動作の関係

| Google Places API | OpenAI API | 動作モード | 店舗データ | 推奨理由 |
|:-:|:-:|---|---|---|
| ❌ | ❌ | デモモード | モックデータ | 定型文 |
| ✅ | ❌ | 実店舗検索モード | 実データ | 簡易的な自動生成 |
| ❌ | ✅ | デモモード | モックデータ | AI生成（未実装） |
| ✅ | ✅ | AI強化モード | 実データ | AI生成の魅力的な文章 |

### 段階的な導入が可能

1. **開発初期**: APIキーなしでUIと基本機能を確認
2. **実データ確認**: Google Places APIキーを追加して実店舗で動作確認
3. **本格運用**: OpenAI APIキーも追加してAI強化された体験を提供

## APIキーの取得方法

### Google Places API
1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成または既存のプロジェクトを選択
3. 「APIとサービス」→「ライブラリ」から「Places API」を有効化
4. 「認証情報」→「認証情報を作成」→「APIキー」
5. 必要に応じてAPIキーの制限を設定（推奨）

### OpenAI API
1. [OpenAI Platform](https://platform.openai.com/)にアクセス
2. アカウントを作成またはログイン
3. 「API keys」セクションで新しいキーを生成
4. 使用量の上限設定を推奨

## セキュリティ

- `.env.local`ファイルは`.gitignore`に含まれています
- APIキーは絶対にコミットしないでください
- 本番環境ではVercelの環境変数機能を使用してください