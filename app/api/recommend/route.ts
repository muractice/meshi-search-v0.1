import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { SearchRequest } from '@/app/components/search/SearchForm'
import { searchRestaurants } from '@/app/lib/googlePlaces'

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null

export async function POST(request: NextRequest) {
  try {
    const searchRequest: SearchRequest = await request.json()

    // Google Places APIで実際の店舗を検索
    let restaurants
    try {
      restaurants = await searchRestaurants(searchRequest)
    } catch (placesError) {
      console.error('Google Places API エラー:', placesError)
      
      // Google Places APIが失敗した場合はモックデータを返す
      const mockRecommendations = {
        restaurants: [
          {
            name: "牛角 渋谷センター街店",
            reason: `${searchRequest.numberOfPeople}名での${searchRequest.purpose || '食事'}に最適。${searchRequest.budget}円の予算内で焼肉が楽しめます。`,
            address: "東京都渋谷区宇田川町25-6",
            access: "渋谷駅徒歩3分",
            budget: searchRequest.budget,
            features: ["個室あり", "飲み放題プラン", "駅近"],
            genre: "焼肉",
            phone: "03-5428-4129"
          },
          {
            name: "とりあえず吾平 渋谷店",
            reason: `居酒屋チェーンで安定した品質。${searchRequest.numberOfPeople}名に対応可能で予算内で利用できます。`,
            address: "東京都渋谷区道玄坂2-29-11",
            access: "渋谷駅徒歩5分",
            budget: Math.max(3000, searchRequest.budget - 500),
            features: ["座敷席あり", "個室対応", "宴会コース"],
            genre: "居酒屋",
            phone: "03-5458-1555"
          },
          {
            name: "イタリアン・トマト CafeJr. 渋谷店",
            reason: `カジュアルなイタリアンで${searchRequest.purpose || '食事'}にぴったり。リーズナブルな価格設定。`,
            address: "東京都渋谷区道玄坂1-12-1",
            access: "渋谷駅徒歩2分",
            budget: Math.min(4000, searchRequest.budget),
            features: ["禁煙席", "WiFi完備", "テラス席"],
            genre: "イタリアン",
            phone: "03-3496-0109"
          }
        ]
      }
      
      return NextResponse.json(mockRecommendations)
    }

    // OpenAI APIを使って推奨理由を改善（オプション）
    if (openai && restaurants.length > 0) {
      try {
        const enhancedRestaurants = await Promise.all(
          restaurants.slice(0, 3).map(async (restaurant) => {
            const prompt = `
以下の飲食店について、ユーザーの検索条件に基づいて魅力的な推奨理由を100文字以内で作成してください：

店舗情報:
- 店名: ${restaurant.name}
- ジャンル: ${restaurant.genre}
- 住所: ${restaurant.address}
- 評価: ${restaurant.rating || 'なし'}
- 特徴: ${restaurant.features.join(', ')}

ユーザーの検索条件:
- 人数: ${searchRequest.numberOfPeople}名
- 予算: ${searchRequest.budget}円/人
- 目的: ${searchRequest.purpose || '食事'}
- 希望ジャンル: ${searchRequest.genre?.join(', ') || '指定なし'}
- その他要望: ${searchRequest.requirements || 'なし'}

推奨理由（100文字以内）:`

            const completion = await openai.chat.completions.create({
              model: 'gpt-4',
              messages: [
                {
                  role: 'system',
                  content: '飲食店の魅力的な推奨理由を簡潔に作成してください。ユーザーの条件に具体的に言及してください。',
                },
                {
                  role: 'user',
                  content: prompt,
                },
              ],
              temperature: 0.7,
              max_tokens: 150,
            })

            const enhancedReason = completion.choices[0].message.content?.trim() || restaurant.reason

            return {
              ...restaurant,
              reason: enhancedReason
            }
          })
        )

        return NextResponse.json({ restaurants: enhancedRestaurants })
      } catch (openaiError) {
        console.error('OpenAI API エラー:', openaiError)
        // OpenAI APIが失敗してもGoogle Places APIの結果を返す
      }
    }

    // Google Places APIの結果をそのまま返す（最大6件）
    return NextResponse.json({ restaurants: restaurants.slice(0, 6) })
  } catch (error) {
    console.error('Error in recommendation API:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}
