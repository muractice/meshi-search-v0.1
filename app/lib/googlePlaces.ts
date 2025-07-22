import { Client } from '@googlemaps/google-maps-services-js'
import { SearchRequest } from '@/app/components/search/SearchForm'

const client = new Client({})

export interface PlaceDetails {
  place_id: string
  name: string
  formatted_address: string
  rating?: number
  price_level?: number
  formatted_phone_number?: string
  website?: string
  opening_hours?: {
    open_now?: boolean
    weekday_text?: string[]
  }
  photos?: Array<{
    photo_reference: string
  }>
  types: string[]
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
}

function mapPriceLevelToBudget(priceLevel?: number): number {
  switch (priceLevel) {
    case 1: return 2000
    case 2: return 3500
    case 3: return 6000
    case 4: return 10000
    default: return 4000
  }
}

function extractPhoneNumber(place: PlaceDetails): string {
  return place.formatted_phone_number || '要問い合わせ'
}

// 距離計算関数（共通）
function calculateDistance(location1: { lat: number; lng: number }, location2: { lat: number; lng: number }): number {
  const R = 6371 // 地球の半径（km）
  const dLat = (location1.lat - location2.lat) * Math.PI / 180
  const dLon = (location1.lng - location2.lng) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(location2.lat * Math.PI / 180) * Math.cos(location1.lat * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

function getAccessInfo(place: PlaceDetails, searchArea: string, searchLocation?: { lat: number; lng: number }): string {
  // 距離計算（簡易版）
  if (searchLocation && place.geometry?.location) {
    const distance = calculateDistance(place.geometry.location, searchLocation)
    
    if (distance < 0.5) {
      return `${searchArea}から徒歩${Math.round(distance * 1000 / 80)}分（約${Math.round(distance * 1000)}m）`
    } else {
      return `${searchArea}から約${distance.toFixed(1)}km`
    }
  }
  
  return `${searchArea}周辺`
}

function generateFeatures(place: PlaceDetails): string[] {
  const features: string[] = []
  
  if (place.rating && place.rating >= 4.0) {
    features.push(`高評価 (★${place.rating})`)
  }
  
  if (place.price_level) {
    const priceLabels = ['', 'リーズナブル', 'お手頃', 'やや高級', '高級']
    features.push(priceLabels[place.price_level] || 'お手頃')
  }
  
  if (place.opening_hours?.open_now) {
    features.push('営業中')
  }
  
  if (place.website) {
    features.push('ウェブサイトあり')
  }
  
  // 料理タイプから特徴を抽出
  if (place.types.includes('meal_takeaway')) {
    features.push('テイクアウト可')
  }
  
  if (place.types.includes('meal_delivery')) {
    features.push('デリバリー可')
  }
  
  return features
}

function getRestaurantType(place: PlaceDetails): string {
  // Google Places APIのtypesから料理ジャンルを推定
  if (place.types.includes('japanese_restaurant')) return '和食'
  if (place.types.includes('chinese_restaurant')) return '中華'
  if (place.types.includes('italian_restaurant')) return 'イタリアン'
  if (place.types.includes('french_restaurant')) return 'フレンチ'
  if (place.types.includes('korean_restaurant')) return '韓国料理'
  if (place.types.includes('indian_restaurant')) return 'インド料理'
  if (place.types.includes('mexican_restaurant')) return 'メキシカン'
  if (place.types.includes('thai_restaurant')) return 'タイ料理'
  if (place.types.includes('pizza_restaurant')) return 'ピザ'
  if (place.types.includes('steak_house')) return 'ステーキ'
  if (place.types.includes('sushi_restaurant')) return '寿司'
  if (place.types.includes('barbecue_restaurant')) return '焼肉'
  if (place.types.includes('seafood_restaurant')) return 'シーフード'
  if (place.types.includes('vegetarian_restaurant')) return 'ベジタリアン'
  if (place.types.includes('vegan_restaurant')) return 'ヴィーガン'
  if (place.types.includes('fast_food_restaurant')) return 'ファストフード'
  if (place.types.includes('cafe')) return 'カフェ'
  if (place.types.includes('bar')) return 'バー'
  
  return 'レストラン'
}

// ジャンルに基づいてキーワードを生成
function getGenreKeyword(genre: string): string {
  const keywordMap: { [key: string]: string } = {
    '和食': 'japanese restaurant 和食 日本料理',
    'イタリアン': 'italian restaurant イタリアン パスタ ピザ',
    'フレンチ': 'french restaurant フレンチ ビストロ',
    '中華': 'chinese restaurant 中華料理 中国料理',
    '焼肉': 'yakiniku bbq 焼肉 韓国料理',
    '居酒屋': 'izakaya 居酒屋 日本酒'
  }
  
  return keywordMap[genre] || genre
}

export async function searchRestaurants(searchRequest: SearchRequest) {
  if (!process.env.GOOGLE_PLACES_API_KEY) {
    throw new Error('Google Places API key is not configured')
  }

  try {
    // まず、エリア情報から座標を取得
    const geocodeResponse = await client.geocode({
      params: {
        address: searchRequest.area + ', Japan',
        key: process.env.GOOGLE_PLACES_API_KEY,
      },
    })

    if (geocodeResponse.data.results.length === 0) {
      throw new Error('指定されたエリアが見つかりません')
    }

    const location = geocodeResponse.data.results[0].geometry.location
    
    let places: any[] = []
    
    // ジャンルが指定されている場合は、各ジャンルごとに検索
    if (searchRequest.genre && searchRequest.genre.length > 0) {
      // 複数ジャンルの場合は個別に検索して結合（OR検索）
      if (searchRequest.genre.length > 1) {
        const allPlaces = new Map() // 重複を避けるためMapを使用
        
        for (const genre of searchRequest.genre) {
          const genreKeyword = getGenreKeyword(genre)
          const searchResponse = await client.placesNearby({
            params: {
              location: location,
              radius: 1000, // 1km圏内に縮小
              type: 'restaurant',
              key: process.env.GOOGLE_PLACES_API_KEY,
              language: 'ja' as any,
              keyword: genreKeyword,
              minprice: searchRequest.budget < 3000 ? 0 : searchRequest.budget < 6000 ? 1 : 2,
              maxprice: searchRequest.budget < 3000 ? 2 : searchRequest.budget < 8000 ? 3 : 4,
            },
          })
          
          // 結果を追加（重複を避ける）
          searchResponse.data.results.forEach(place => {
            if (place.place_id) {
              allPlaces.set(place.place_id, place)
            }
          })
        }
        
        places = Array.from(allPlaces.values())
      } else {
        // 単一ジャンルの場合
        const genreKeyword = getGenreKeyword(searchRequest.genre[0])
        const searchResponse = await client.placesNearby({
          params: {
            location: location,
            radius: 2000,
            type: 'restaurant',
            key: process.env.GOOGLE_PLACES_API_KEY,
            language: 'ja' as any,
            keyword: genreKeyword,
            minprice: searchRequest.budget < 3000 ? 0 : searchRequest.budget < 6000 ? 1 : 2,
            maxprice: searchRequest.budget < 3000 ? 2 : searchRequest.budget < 8000 ? 3 : 4,
          },
        })
        places = searchResponse.data.results
      }
    } else {
      // ジャンル指定なしの場合
      const searchResponse = await client.placesNearby({
        params: {
          location: location,
          radius: 2000,
          type: 'restaurant',
          key: process.env.GOOGLE_PLACES_API_KEY,
          language: 'ja' as any,
          minprice: searchRequest.budget < 3000 ? 0 : searchRequest.budget < 6000 ? 1 : 2,
          maxprice: searchRequest.budget < 3000 ? 2 : searchRequest.budget < 8000 ? 3 : 4,
        },
      })
      places = searchResponse.data.results
    }
    
    // 追加のフィルタリングは不要（既にキーワード検索でフィルタリング済み）
    
    // 最大12件に制限（後でソートして6件に絞る）
    places = places.slice(0, 12)

    // 詳細情報を取得
    const detailedPlaces: PlaceDetails[] = []
    
    for (const place of places) {
      if (place.place_id) {
        try {
          const detailResponse = await client.placeDetails({
            params: {
              place_id: place.place_id,
              fields: [
                'name',
                'formatted_address',
                'formatted_phone_number',
                'rating',
                'price_level',
                'website',
                'opening_hours',
                'photos',
                'types',
                'geometry'
              ],
              key: process.env.GOOGLE_PLACES_API_KEY,
              language: 'ja' as any,
            },
          })
          
          if (detailResponse.data.result) {
            detailedPlaces.push(detailResponse.data.result as PlaceDetails)
          }
        } catch (error) {
          console.error('詳細情報取得エラー:', error)
          // 個別のエラーは無視して続行
        }
      }
    }

    // ソート条件に基づいてソート
    detailedPlaces.sort((a, b) => {
      switch (searchRequest.sortBy) {
        case 'distance':
          // 距離優先（500m以内を優先）
          const aDistance = calculateDistance(a.geometry.location, location)
          const bDistance = calculateDistance(b.geometry.location, location)
          
          // 500m以内を優先
          const aWithin500m = aDistance <= 0.5 ? 1 : 0
          const bWithin500m = bDistance <= 0.5 ? 1 : 0
          
          if (aWithin500m !== bWithin500m) {
            return bWithin500m - aWithin500m
          }
          
          // 同じ距離帯なら実際の距離で並べ替え
          return aDistance - bDistance
          
        case 'rating':
          // 評価優先
          const aRating = a.rating || 0
          const bRating = b.rating || 0
          
          // 高評価順
          if (aRating !== bRating) {
            return bRating - aRating
          }
          
          // 同じ評価なら距離で並べ替え
          const aDistanceRating = calculateDistance(a.geometry.location, location)
          const bDistanceRating = calculateDistance(b.geometry.location, location)
          return aDistanceRating - bDistanceRating
          
        case 'genre':
          // ジャンル一致優先
          if (searchRequest.genre && searchRequest.genre.length > 0) {
            const aGenre = getRestaurantType(a)
            const bGenre = getRestaurantType(b)
            const aMatch = searchRequest.genre.includes(aGenre) ? 1 : 0
            const bMatch = searchRequest.genre.includes(bGenre) ? 1 : 0
            
            // ジャンルが一致する店舗を優先
            if (aMatch !== bMatch) return bMatch - aMatch
            
            // 両方一致または不一致の場合は評価で並べ替え
            return (b.rating || 0) - (a.rating || 0)
          }
          // ジャンル指定がない場合は評価順
          return (b.rating || 0) - (a.rating || 0)
          
        default:
          // デフォルトは距離優先
          const defaultADistance = calculateDistance(a.geometry.location, location)
          const defaultBDistance = calculateDistance(b.geometry.location, location)
          return defaultADistance - defaultBDistance
      }
    })
    
    // 最大6件に制限
    const sortedPlaces = detailedPlaces.slice(0, 6)

    // フォーマットして返す
    return sortedPlaces.map(place => {
      const restaurantGenre = getRestaurantType(place)
      const isGenreMatch = searchRequest.genre && searchRequest.genre.includes(restaurantGenre)
      
      return {
        name: place.name,
        reason: `${restaurantGenre}のお店で、${searchRequest.area}エリアの${isGenreMatch ? '希望ジャンルに一致する' : ''}人気店です。${place.rating ? `評価${place.rating}★` : ''}${place.price_level ? `、価格帯も${searchRequest.budget}円の予算に適しています。` : ''}`,
        address: place.formatted_address,
        access: getAccessInfo(place, searchRequest.area, location),
        budget: place.price_level ? mapPriceLevelToBudget(place.price_level) : searchRequest.budget,
        features: generateFeatures(place),
        genre: restaurantGenre,
        phone: extractPhoneNumber(place),
        place_id: place.place_id,
        rating: place.rating,
        website: place.website
      }
    })

  } catch (error) {
    console.error('Google Places API エラー:', error)
    throw new Error('店舗検索に失敗しました')
  }
}
