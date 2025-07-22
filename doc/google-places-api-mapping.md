# Google Places API マッピング仕様書

## 概要
ユーザーが入力した検索条件がGoogle Places APIにどのようにマッピングされているかを詳細に説明します。

## 入力項目とAPIパラメータのマッピング

### 1. 日付・時間
- **入力項目**: `date`, `time`
- **API利用**: ❌ **現在未使用**
- **理由**: Google Places APIは営業時間情報を提供しますが、検索フィルタとしては使用していません
- **改善案**: `opening_hours`で営業中の店舗をフィルタリング可能

### 2. 人数
- **入力項目**: `numberOfPeople`
- **API利用**: ❌ **現在未使用**
- **理由**: Google Places APIは収容人数での検索をサポートしていません
- **活用方法**: レスポンスの`reason`フィールドで人数に言及

### 3. エリア（駅名・地名）
- **入力項目**: `area`
- **APIマッピング**: 
  ```javascript
  // 1. Geocoding APIで座標取得
  address: searchRequest.area + ', Japan'
  
  // 2. Places Nearby APIで検索
  location: { lat, lng } // Geocodingで取得した座標
  radius: 2000 // 半径2km固定
  ```
- **利用状況**: ✅ **完全実装済み**

### 4. 予算（一人あたり）
- **入力項目**: `budget`
- **APIマッピング**:
  ```javascript
  // Google Places APIの価格レベル（0-4）にマッピング
  minprice: searchRequest.budget < 3000 ? 0 : searchRequest.budget < 6000 ? 1 : 2
  maxprice: searchRequest.budget < 3000 ? 2 : searchRequest.budget < 8000 ? 3 : 4
  
  // 価格レベルと予算の対応表
  // 0: 無料
  // 1: ¥2,000 (リーズナブル)
  // 2: ¥3,500 (お手頃)  
  // 3: ¥6,000 (やや高級)
  // 4: ¥10,000 (高級)
  ```
- **利用状況**: ✅ **完全実装済み**

### 5. 利用目的
- **入力項目**: `purpose`
- **API利用**: ❌ **現在未使用**
- **活用方法**: OpenAI APIでの推奨理由生成時に使用

### 6. 料理ジャンル
- **入力項目**: `genre[]`
- **API利用**: ❌ **部分的な制限**
- **理由**: Google Places APIの検索では`type: 'restaurant'`のみ使用
- **現在の実装**: レスポンス後にジャンル判定を実行
  ```javascript
  // APIレスポンスのtypesから料理ジャンルを推定
  if (place.types.includes('japanese_restaurant')) return '和食'
  if (place.types.includes('italian_restaurant')) return 'イタリアン'
  // ... その他のマッピング
  ```
- **改善案**: 検索時にジャンル固有のキーワードを追加

### 7. その他の要望
- **入力項目**: `requirements`
- **API利用**: ❌ **現在未使用**
- **活用方法**: OpenAI APIでの推奨理由生成時に使用

## 現在のAPI呼び出しフロー

```javascript
// 1. エリア → 座標変換
const geocodeResponse = await client.geocode({
  params: {
    address: searchRequest.area + ', Japan',
    key: process.env.GOOGLE_PLACES_API_KEY,
  },
})

// 2. レストラン検索
const searchResponse = await client.placesNearby({
  params: {
    location: location,           // ✅ エリアから変換
    radius: 2000,                // 固定値
    type: 'restaurant',          // 固定値
    key: process.env.GOOGLE_PLACES_API_KEY,
    language: 'ja',
    minprice: /* 予算ベース */,  // ✅ 予算から変換
    maxprice: /* 予算ベース */,  // ✅ 予算から変換
  },
})

// 3. 詳細情報取得
const detailResponse = await client.placeDetails({
  params: {
    place_id: place.place_id,
    fields: [
      'name', 'formatted_address', 'formatted_phone_number',
      'rating', 'price_level', 'website', 'opening_hours',
      'photos', 'types', 'geometry'
    ],
    key: process.env.GOOGLE_PLACES_API_KEY,
    language: 'ja',
  },
})
```

## 未活用の検索条件

### 🔴 高優先度で改善が必要
1. **料理ジャンル**: 検索フィルタリングに未使用
2. **営業時間**: 日付・時間の条件が未反映

### 🟡 中優先度で改善検討
3. **人数**: APIでは直接検索できないが、大型店舗の優先表示が可能
4. **利用目的**: 推奨理由の改善に活用
5. **その他要望**: 推奨理由の改善に活用

## 改善提案

### 1. 料理ジャンルの検索活用
```javascript
// ジャンル別キーワード検索を追加
if (searchRequest.genre?.includes('和食')) {
  keyword = 'japanese restaurant sushi'
}
// Places Text Searchの利用を検討
```

### 2. 営業時間フィルタリング
```javascript
// 営業中の店舗のみフィルタリング
const openNowPlaces = places.filter(place => 
  place.opening_hours?.open_now === true
)
```

### 3. より詳細な予算マッピング
```javascript
// より細かい予算設定
const getBudgetRange = (budget) => {
  if (budget < 2000) return { min: 0, max: 1 }
  if (budget < 3500) return { min: 1, max: 2 }
  if (budget < 5000) return { min: 2, max: 2 }
  if (budget < 7000) return { min: 2, max: 3 }
  return { min: 3, max: 4 }
}
```

## まとめ

現在、**エリア**と**予算**のみがGoogle Places APIに直接反映されています。その他の条件（ジャンル、日時、人数、目的、要望）は検索には使用されておらず、主にOpenAI APIでの推奨理由生成や後処理で活用されています。

より精度の高い検索結果を得るには、特に**料理ジャンル**と**営業時間**の活用が重要です。