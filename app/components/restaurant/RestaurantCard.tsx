'use client'

import { cn } from '@/app/lib/utils'
import * as Separator from '@radix-ui/react-separator'

export interface Restaurant {
  name: string
  reason: string
  address: string
  access: string
  budget: number
  features: string[]
  genre: string
  phone: string
  place_id?: string
  rating?: number
  website?: string
}

interface RestaurantCardProps {
  restaurant: Restaurant
  onReserve: (restaurant: Restaurant) => void
}

export default function RestaurantCard({ restaurant, onReserve }: RestaurantCardProps) {
  return (
    <div className={cn(
      "bg-white rounded-lg shadow-md p-6",
      "hover:shadow-lg transition-shadow duration-200",
      "border border-gray-100"
    )}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">{restaurant.name}</h3>
          <div className="flex items-center gap-2 mb-2">
            <span className={cn(
              "inline-block text-sm px-2 py-1 rounded",
              "bg-blue-100 text-blue-800 font-medium"
            )}>
              {restaurant.genre}
            </span>
            {restaurant.rating && (
              <span className="inline-flex items-center text-sm text-yellow-600 font-medium">
                ⭐ {restaurant.rating}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">
            ¥{restaurant.budget.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">一人あたり</div>
        </div>
      </div>

      <Separator.Root className="bg-gray-200 data-[orientation=horizontal]:h-[1px] data-[orientation=horizontal]:w-full mb-4" />

      <div className="mb-4">
        <h4 className="font-semibold text-gray-700 mb-2">おすすめ理由</h4>
        <p className="text-gray-600 text-sm leading-relaxed">{restaurant.reason}</p>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-start">
          <span className="text-gray-500 text-sm font-medium w-16">住所:</span>
          <span className="text-gray-700 text-sm flex-1">{restaurant.address}</span>
        </div>
        <div className="flex items-start">
          <span className="text-gray-500 text-sm font-medium w-16">アクセス:</span>
          <span className="text-gray-700 text-sm flex-1">{restaurant.access}</span>
        </div>
        <div className="flex items-start">
          <span className="text-gray-500 text-sm font-medium w-16">電話:</span>
          <a 
            href={`tel:${restaurant.phone}`}
            className={cn(
              "text-blue-600 text-sm hover:underline",
              "focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 rounded"
            )}
          >
            {restaurant.phone}
          </a>
        </div>
        {restaurant.website && (
          <div className="flex items-start">
            <span className="text-gray-500 text-sm font-medium w-16">サイト:</span>
            <a 
              href={restaurant.website}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "text-blue-600 text-sm hover:underline",
                "focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 rounded"
              )}
            >
              公式サイト
            </a>
          </div>
        )}
      </div>

      {restaurant.features.length > 0 && (
        <>
          <Separator.Root className="bg-gray-200 data-[orientation=horizontal]:h-[1px] data-[orientation=horizontal]:w-full mb-4" />
          <div className="mb-4">
            <h4 className="font-semibold text-gray-700 mb-2">特徴</h4>
            <div className="flex flex-wrap gap-2">
              {restaurant.features.map((feature, index) => (
                <span
                  key={index}
                  className={cn(
                    "bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded",
                    "font-medium"
                  )}
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </>
      )}

      <button
        onClick={() => onReserve(restaurant)}
        className={cn(
          "w-full py-3 rounded-lg font-semibold",
          "bg-blue-600 text-white hover:bg-blue-700",
          "focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2",
          "transition-colors duration-200",
          "active:scale-[0.98] transform"
        )}
      >
        この店に予約リクエスト
      </button>
    </div>
  )
}