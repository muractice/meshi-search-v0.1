'use client'

import { useState } from 'react'
import RestaurantCard, { Restaurant } from './RestaurantCard'
import { SearchRequest } from '../search/SearchForm'
import { cn } from '@/app/lib/utils'
import { ChevronLeftIcon, ChevronDownIcon, CheckIcon } from '@radix-ui/react-icons'
import * as Separator from '@radix-ui/react-separator'
import * as Select from '@radix-ui/react-select'
import * as Label from '@radix-ui/react-label'

interface ResultsListProps {
  searchRequest: SearchRequest
  restaurants: Restaurant[]
  onBackToSearch: () => void
}

export default function ResultsList({ searchRequest, restaurants, onBackToSearch }: ResultsListProps) {
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [currentSortBy, setCurrentSortBy] = useState<'distance' | 'rating' | 'genre'>(searchRequest.sortBy || 'distance')
  const [sortedRestaurants, setSortedRestaurants] = useState<Restaurant[]>(restaurants)
  const [isLoading, setIsLoading] = useState(false)

  const handleReserve = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant)
    // TODO: 予約フォームを表示
    alert(`${restaurant.name}の予約リクエスト機能は後で実装します`)
  }

  const handleSortChange = async (newSortBy: 'distance' | 'rating' | 'genre') => {
    if (newSortBy === currentSortBy) return
    
    setIsLoading(true)
    setCurrentSortBy(newSortBy)
    
    try {
      // 新しいソート条件で再検索
      const updatedSearchRequest = { ...searchRequest, sortBy: newSortBy }
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSearchRequest),
      })

      if (response.ok) {
        const data = await response.json()
        setSortedRestaurants(data.restaurants)
      } else {
        console.error('再検索に失敗しました')
      }
    } catch (error) {
      console.error('ソート変更エラー:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getSortLabel = (sortBy: string) => {
    switch (sortBy) {
      case 'distance':
        return '距離が近い順（500m以内優先）'
      case 'rating':
        return '評価が高い順'
      case 'genre':
        return 'ジャンル一致優先'
      default:
        return '距離が近い順'
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* ヘッダー部分 */}
      <div className="mb-8">
        <button
          onClick={onBackToSearch}
          className={cn(
            "flex items-center text-blue-600 hover:text-blue-700 mb-4",
            "focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 rounded-md px-2 py-1",
            "transition-colors duration-200"
          )}
        >
          <ChevronLeftIcon className="w-5 h-5 mr-2" />
          検索条件を変更（ステップ3へ）
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          おすすめの飲食店
        </h1>
        
        <div className={cn(
          "bg-gray-50 rounded-lg p-4",
          "border border-gray-200"
        )}>
          <h2 className="font-semibold text-gray-700 mb-3">検索条件</h2>
          <Separator.Root className="bg-gray-200 data-[orientation=horizontal]:h-[1px] data-[orientation=horizontal]:w-full mb-3" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">日時:</span>
              <span className="ml-2 font-medium text-gray-800">{searchRequest.date} {searchRequest.time}</span>
            </div>
            <div>
              <span className="text-gray-500">人数:</span>
              <span className="ml-2 font-medium text-gray-800">{searchRequest.numberOfPeople}人</span>
            </div>
            <div>
              <span className="text-gray-500">エリア:</span>
              <span className="ml-2 font-medium text-gray-800">{searchRequest.area}</span>
            </div>
            <div>
              <span className="text-gray-500">予算:</span>
              <span className="ml-2 font-medium text-gray-800">¥{searchRequest.budget.toLocaleString()}/人</span>
            </div>
            {searchRequest.purpose && (
              <div>
                <span className="text-gray-500">目的:</span>
                <span className="ml-2 font-medium text-gray-800">{searchRequest.purpose}</span>
              </div>
            )}
            {searchRequest.genre && searchRequest.genre.length > 0 && (
              <div className="col-span-2">
                <span className="text-gray-500">ジャンル:</span>
                <span className="ml-2 font-medium text-gray-800">{searchRequest.genre.join(', ')}</span>
              </div>
            )}
          </div>
        </div>

        {/* ソート選択 */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Label.Root htmlFor="sort-select" className="text-sm font-medium text-gray-700">
              表示順:
            </Label.Root>
            <Select.Root value={currentSortBy} onValueChange={handleSortChange}>
              <Select.Trigger 
                id="sort-select"
                className={cn(
                  "px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900",
                  "focus:bg-white focus:border-blue-400 focus:outline-none",
                  "transition-all duration-200 flex items-center justify-between min-w-[240px]",
                  "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
                disabled={isLoading}
              >
                <Select.Value />
                <Select.Icon>
                  <ChevronDownIcon className={cn(
                    "w-4 h-4 text-gray-500 transition-transform",
                    isLoading && "animate-spin"
                  )} />
                </Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content 
                  className={cn(
                    "overflow-hidden bg-white rounded-lg shadow-lg",
                    "border border-gray-200 z-50"
                  )}
                >
                  <Select.Viewport className="p-1">
                    <Select.Item
                      value="distance"
                      className={cn(
                        "flex items-center px-3 py-2 text-sm text-gray-900 rounded-md",
                        "focus:bg-blue-50 focus:outline-none cursor-pointer",
                        "data-[highlighted]:bg-blue-50 data-[state=checked]:font-medium"
                      )}
                    >
                      <Select.ItemText>距離が近い順（500m以内優先）</Select.ItemText>
                      <Select.ItemIndicator className="ml-auto">
                        <CheckIcon className="w-4 h-4 text-blue-600" />
                      </Select.ItemIndicator>
                    </Select.Item>
                    <Select.Item
                      value="rating"
                      className={cn(
                        "flex items-center px-3 py-2 text-sm text-gray-900 rounded-md",
                        "focus:bg-blue-50 focus:outline-none cursor-pointer",
                        "data-[highlighted]:bg-blue-50 data-[state=checked]:font-medium"
                      )}
                    >
                      <Select.ItemText>評価が高い順</Select.ItemText>
                      <Select.ItemIndicator className="ml-auto">
                        <CheckIcon className="w-4 h-4 text-blue-600" />
                      </Select.ItemIndicator>
                    </Select.Item>
                    <Select.Item
                      value="genre"
                      className={cn(
                        "flex items-center px-3 py-2 text-sm text-gray-900 rounded-md",
                        "focus:bg-blue-50 focus:outline-none cursor-pointer",
                        "data-[highlighted]:bg-blue-50 data-[state=checked]:font-medium"
                      )}
                    >
                      <Select.ItemText>ジャンル一致優先</Select.ItemText>
                      <Select.ItemIndicator className="ml-auto">
                        <CheckIcon className="w-4 h-4 text-blue-600" />
                      </Select.ItemIndicator>
                    </Select.Item>
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          </div>
          
          <div className="text-sm text-gray-600">
            {sortedRestaurants.length}件の結果
          </div>
        </div>
      </div>

      {/* 結果一覧 */}
      {isLoading ? (
        <div className={cn(
          "text-center py-12",
          "bg-gray-50 rounded-lg border border-gray-200"
        )}>
          <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
          <p className="text-gray-600">検索結果を並び替えています...</p>
        </div>
      ) : sortedRestaurants.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedRestaurants.map((restaurant, index) => (
            <RestaurantCard
              key={`${restaurant.name}-${index}`}
              restaurant={restaurant}
              onReserve={handleReserve}
            />
          ))}
        </div>
      ) : (
        <div className={cn(
          "text-center py-12",
          "bg-gray-50 rounded-lg border border-gray-200"
        )}>
          <div className="text-6xl mb-4">😔</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            条件に合う店舗が見つかりませんでした
          </h3>
          <p className="text-gray-500 mb-6">
            検索条件を変更して再度お試しください。
          </p>
          <button
            onClick={onBackToSearch}
            className={cn(
              "bg-blue-600 text-white px-6 py-2 rounded-lg",
              "hover:bg-blue-700 transition-colors duration-200",
              "focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2",
              "font-medium"
            )}
          >
            検索条件を変更
          </button>
        </div>
      )}
    </div>
  )
}