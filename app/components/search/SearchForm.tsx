'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import * as Select from '@radix-ui/react-select'
import * as Slider from '@radix-ui/react-slider'
import * as Checkbox from '@radix-ui/react-checkbox'
import * as Label from '@radix-ui/react-label'
import { ChevronDownIcon, CheckIcon } from '@radix-ui/react-icons'
import { cn } from '@/app/lib/utils'

export interface SearchRequest {
  date: string
  time: string
  numberOfPeople: number
  area: string
  budget: number
  purpose?: string
  genre?: string[]
  requirements?: string
  sortBy?: 'distance' | 'rating' | 'genre' // ソート条件
}

interface SearchFormProps {
  onSearchComplete?: (searchRequest: SearchRequest, restaurants: any[]) => void
  initialData?: SearchRequest
  onFormDataChange?: (data: SearchRequest) => void
  initialStep?: number
  onStepChange?: (step: number) => void
}

export default function SearchForm({ onSearchComplete, initialData, onFormDataChange, initialStep = 1, onStepChange }: SearchFormProps) {
  const router = useRouter()
  const [step, setStep] = useState(initialStep)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<SearchRequest>(initialData || {
    date: '',
    time: '',
    numberOfPeople: 2,
    area: '',
    budget: 5000,
    purpose: '',
    genre: [],
    requirements: '',
    sortBy: 'distance', // デフォルトは距離優先
  })

  // フォームデータが変更されたら親に通知
  const updateFormData = (newData: SearchRequest) => {
    setFormData(newData)
    if (onFormDataChange) {
      onFormDataChange(newData)
    }
  }

  // initialDataが変更されたら反映
  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    }
  }, [initialData])

  // initialStepが変更されたら反映
  useEffect(() => {
    setStep(initialStep)
  }, [initialStep])

  // ステップが変更されたら親に通知
  useEffect(() => {
    if (onStepChange) {
      onStepChange(step)
    }
  }, [step, onStepChange])

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        if (onSearchComplete) {
          onSearchComplete(formData, data.restaurants)
        }
      } else {
        alert('検索に失敗しました。もう一度お試しください。')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('エラーが発生しました。もう一度お試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.date && formData.time && formData.numberOfPeople > 0
      case 2:
        return formData.area && formData.budget > 0
      case 3:
        return true
      default:
        return false
    }
  }

  const timeOptions = [
    '17:00', '17:30', '18:00', '18:30', '19:00', 
    '19:30', '20:00', '20:30', '21:00'
  ]

  const purposeOptions = [
    '歓送迎会', '接待', 'デート', '友人との食事', '家族との食事', 'その他'
  ]

  const genreOptions = ['和食', 'イタリアン', 'フレンチ', '中華', '焼肉', '居酒屋']

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className={cn(
                "flex-1 h-2 mx-1 rounded-full transition-all duration-300",
                num <= step ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-200'
              )}
            />
          ))}
        </div>
        <p className="text-sm text-gray-600 text-center">
          ステップ {step} / 3
        </p>
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">基本情報を入力</h2>
          
          <div className="space-y-2">
            <Label.Root htmlFor="date" className="text-sm font-medium text-gray-700">
              日付
            </Label.Root>
            <input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => updateFormData({ ...formData, date: e.target.value })}
              className={cn(
                "w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900",
                "placeholder-gray-400 focus:bg-white focus:border-blue-400 focus:outline-none",
                "transition-all duration-200 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              )}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="space-y-2">
            <Label.Root htmlFor="time" className="text-sm font-medium text-gray-700">
              時間帯
            </Label.Root>
            <Select.Root value={formData.time || undefined} onValueChange={(value) => updateFormData({ ...formData, time: value })}>
              <Select.Trigger 
                id="time"
                className={cn(
                  "w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900",
                  "focus:bg-white focus:border-blue-400 focus:outline-none",
                  "transition-all duration-200 flex items-center justify-between",
                  "data-[placeholder]:text-gray-400 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                )}
              >
                <Select.Value placeholder="選択してください" />
                <Select.Icon>
                  <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                </Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content 
                  className={cn(
                    "overflow-hidden bg-white rounded-xl shadow-lg",
                    "border border-gray-200 z-50"
                  )}
                >
                  <Select.ScrollUpButton className="flex items-center justify-center h-6 bg-white text-gray-700 hover:bg-gray-50">
                    <ChevronDownIcon className="rotate-180" />
                  </Select.ScrollUpButton>
                  <Select.Viewport className="p-1">
                    {timeOptions.map((time) => (
                      <Select.Item
                        key={time}
                        value={time}
                        className={cn(
                          "flex items-center px-3 py-2 text-sm text-gray-900 rounded-md",
                          "focus:bg-blue-50 focus:outline-none cursor-pointer",
                          "data-[highlighted]:bg-blue-50 data-[state=checked]:font-medium"
                        )}
                      >
                        <Select.ItemText>{time}</Select.ItemText>
                        <Select.ItemIndicator className="ml-auto">
                          <CheckIcon className="w-4 h-4 text-blue-600" />
                        </Select.ItemIndicator>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                  <Select.ScrollDownButton className="flex items-center justify-center h-6 bg-white text-gray-700 hover:bg-gray-50">
                    <ChevronDownIcon />
                  </Select.ScrollDownButton>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          </div>

          <div className="space-y-2">
            <Label.Root htmlFor="numberOfPeople" className="text-sm font-medium text-gray-700">
              人数
            </Label.Root>
            <input
              id="numberOfPeople"
              type="number"
              value={formData.numberOfPeople}
              onChange={(e) => updateFormData({ ...formData, numberOfPeople: parseInt(e.target.value) || 1 })}
              className={cn(
                "w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900",
                "placeholder-gray-400 focus:bg-white focus:border-blue-400 focus:outline-none",
                "transition-all duration-200 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              )}
              min="1"
              max="50"
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">エリアと予算</h2>
          
          <div className="space-y-2">
            <Label.Root htmlFor="area" className="text-sm font-medium text-gray-700">
              エリア（駅名や地名）
            </Label.Root>
            <input
              id="area"
              type="text"
              value={formData.area}
              onChange={(e) => updateFormData({ ...formData, area: e.target.value })}
              className={cn(
                "w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900",
                "placeholder-gray-400 focus:bg-white focus:border-blue-400 focus:outline-none",
                "transition-all duration-200 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              )}
              placeholder="例：渋谷、六本木、銀座"
            />
          </div>

          <div className="space-y-2">
            <Label.Root htmlFor="budget" className="text-sm font-medium text-gray-700">
              予算（一人あたり）
            </Label.Root>
            <div className="space-y-4">
              <Slider.Root
                id="budget"
                value={[formData.budget]}
                onValueChange={(value) => updateFormData({ ...formData, budget: value[0] })}
                min={2000}
                max={15000}
                step={500}
                className="relative flex items-center select-none touch-none w-full h-5"
              >
                <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
                  <Slider.Range className="absolute bg-gradient-to-r from-blue-500 to-purple-500 rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb 
                  className={cn(
                    "block w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full",
                    "hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400",
                    "cursor-pointer transition-transform hover:scale-110 shadow-md"
                  )}
                />
              </Slider.Root>
              <div className="text-center">
                <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ¥{formData.budget.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label.Root htmlFor="purpose" className="text-sm font-medium text-gray-700">
              利用目的（任意）
            </Label.Root>
            <Select.Root value={formData.purpose || undefined} onValueChange={(value) => updateFormData({ ...formData, purpose: value })}>
              <Select.Trigger 
                id="purpose"
                className={cn(
                  "w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900",
                  "focus:bg-white focus:border-blue-400 focus:outline-none",
                  "transition-all duration-200 flex items-center justify-between",
                  "data-[placeholder]:text-gray-400 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                )}
              >
                <Select.Value placeholder="選択してください" />
                <Select.Icon>
                  <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                </Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content 
                  className={cn(
                    "overflow-hidden bg-white rounded-xl shadow-lg",
                    "border border-gray-200 z-50"
                  )}
                >
                  <Select.Viewport className="p-1">
                    {purposeOptions.map((purpose) => (
                      <Select.Item
                        key={purpose}
                        value={purpose}
                        className={cn(
                          "flex items-center px-3 py-2 text-sm text-gray-900 rounded-md",
                          "focus:bg-blue-50 focus:outline-none cursor-pointer",
                          "data-[highlighted]:bg-blue-50 data-[state=checked]:font-medium"
                        )}
                      >
                        <Select.ItemText>{purpose}</Select.ItemText>
                        <Select.ItemIndicator className="ml-auto">
                          <CheckIcon className="w-4 h-4 text-blue-600" />
                        </Select.ItemIndicator>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          </div>

          <div className="space-y-2">
            <Label.Root htmlFor="sortBy" className="text-sm font-medium text-gray-700">
              表示順
            </Label.Root>
            <Select.Root value={formData.sortBy || 'distance'} onValueChange={(value) => updateFormData({ ...formData, sortBy: value as 'distance' | 'rating' | 'genre' })}>
              <Select.Trigger 
                id="sortBy"
                className={cn(
                  "w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900",
                  "focus:bg-white focus:border-blue-400 focus:outline-none",
                  "transition-all duration-200 flex items-center justify-between",
                  "data-[placeholder]:text-gray-400 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                )}
              >
                <Select.Value />
                <Select.Icon>
                  <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                </Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content 
                  className={cn(
                    "overflow-hidden bg-white rounded-xl shadow-lg",
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
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">その他の要望（任意）</h2>
          
          <div>
            <Label.Root className="text-sm font-medium text-gray-700 mb-4 block">
              料理ジャンル
            </Label.Root>
            <div className="grid grid-cols-2 gap-3">
              {genreOptions.map((genre) => (
                <label 
                  key={genre} 
                  className={cn(
                    "flex items-center p-3 bg-gray-50 rounded-xl border border-gray-300",
                    "hover:bg-white hover:border-gray-400 transition-all duration-200 cursor-pointer"
                  )}
                >
                  <Checkbox.Root
                    checked={formData.genre?.includes(genre) || false}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateFormData({ ...formData, genre: [...(formData.genre || []), genre] })
                      } else {
                        updateFormData({ ...formData, genre: formData.genre?.filter(g => g !== genre) || [] })
                      }
                    }}
                    className={cn(
                      "w-4 h-4 rounded bg-white border border-gray-300",
                      "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500",
                      "data-[state=checked]:to-purple-500 data-[state=checked]:border-transparent",
                      "focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                    )}
                  >
                    <Checkbox.Indicator>
                      <CheckIcon className="w-3 h-3 text-white" />
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                  <span className="text-gray-900 ml-3">{genre}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label.Root htmlFor="requirements" className="text-sm font-medium text-gray-700">
              その他の要望
            </Label.Root>
            <textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => updateFormData({ ...formData, requirements: e.target.value })}
              className={cn(
                "w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900",
                "placeholder-gray-400 focus:bg-white focus:border-blue-400 focus:outline-none",
                "transition-all duration-200 resize-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              )}
              rows={4}
              placeholder="例：個室希望、禁煙席、アレルギー対応など"
            />
          </div>
        </div>
      )}

      <div className="flex justify-between mt-10">
        {step > 1 && (
          <button
            onClick={handleBack}
            className={cn(
              "px-6 py-3 border border-gray-300 rounded-xl text-gray-700",
              "hover:bg-gray-50 transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            )}
          >
            戻る
          </button>
        )}
        
        <div className="ml-auto">
          {step < 3 ? (
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className={cn(
                "px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl",
                "hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400",
                "disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105",
                "focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              )}
            >
              次へ
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={cn(
                "px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl",
                "hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400",
                "disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105",
                "flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              )}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  提案を生成中...
                </>
              ) : (
                'AIに提案してもらう'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}