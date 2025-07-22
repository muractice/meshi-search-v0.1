'use client'

import { useState } from 'react'
import SearchForm, { SearchRequest } from './components/search/SearchForm'
import ResultsList from './components/restaurant/ResultsList'
import { Restaurant } from './components/restaurant/RestaurantCard'

type ViewState = 'home' | 'search' | 'results'

export default function HomePage() {
  const [currentView, setCurrentView] = useState<ViewState>('home')
  const [searchRequest, setSearchRequest] = useState<SearchRequest | null>(null)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [searchFormStep, setSearchFormStep] = useState(1)
  const [searchFormData, setSearchFormData] = useState<SearchRequest>({
    date: '',
    time: '',
    numberOfPeople: 2,
    area: '',
    budget: 5000,
    purpose: '',
    genre: [],
    requirements: '',
    sortBy: 'distance',
  })

  const handleSearchComplete = (request: SearchRequest, restaurantList: Restaurant[]) => {
    setSearchRequest(request)
    setSearchFormData(request) // 検索条件を保存
    setRestaurants(restaurantList)
    setCurrentView('results')
  }

  const handleBackToSearch = () => {
    setSearchFormStep(3) // ステップ3に戻る
    setCurrentView('search')
  }

  const handleBackToHome = () => {
    setCurrentView('home')
  }

  return (
    <main className="min-h-screen bg-white">
      {currentView === 'home' && (
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            {/* ヒーローセクション */}
            <div className="text-center mb-20">
              <div className="inline-block mb-8">
                <span className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-full text-gray-700 text-sm font-medium">
                  AI搭載の飲食店予約サービス
                </span>
              </div>
              <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight text-black">
                最高の
                <span className="block">飲食体験を</span>
                <span className="block">AIがサポート</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                もう店選びに悩まない。あなたの希望を伝えるだけで、
                <br className="hidden md:block" />
                AIが最適な飲食店を提案し、予約まで代行します。
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={() => {
                    setSearchFormStep(1) // ステップ1から開始
                    setCurrentView('search')
                  }}
                  className="btn-primary text-lg inline-flex items-center gap-2"
                >
                  今すぐ始める
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button className="btn-secondary text-lg">
                  サービス詳細
                </button>
              </div>
            </div>

            {/* 特徴セクション */}
            <div className="grid md:grid-cols-3 gap-8 mb-20">
              <div className="bg-white border border-gray-200 p-8 rounded-3xl card-hover shadow-soft">
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-black mb-4">簡単検索</h3>
                <p className="text-gray-600 leading-relaxed">
                  日時・人数・エリア・予算を入力するだけ。複雑な条件設定は不要です。
                </p>
              </div>
              
              <div className="bg-white border border-gray-200 p-8 rounded-3xl card-hover shadow-soft">
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-black mb-4">AI提案</h3>
                <p className="text-gray-600 leading-relaxed">
                  最新のAI技術で、あなたにぴったりの店舗を厳選。理由も明確に説明します。
                </p>
              </div>
              
              <div className="bg-white border border-gray-200 p-8 rounded-3xl card-hover shadow-soft">
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-black mb-4">予約代行</h3>
                <p className="text-gray-600 leading-relaxed">
                  気に入った店を選ぶだけ。面倒な予約手続きは私たちが代行します。
                </p>
              </div>
            </div>

            {/* 統計セクション */}
            <div className="text-center py-16 bg-gray-50 rounded-3xl">
              <h2 className="text-3xl font-bold text-black mb-12">数字で見るmeshi-search</h2>
              <div className="grid grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div>
                  <div className="text-5xl font-bold text-black mb-2">2分</div>
                  <div className="text-gray-600 font-medium">平均検索時間</div>
                </div>
                <div>
                  <div className="text-5xl font-bold text-black mb-2">95%</div>
                  <div className="text-gray-600 font-medium">顧客満足度</div>
                </div>
                <div>
                  <div className="text-5xl font-bold text-black mb-2">24時間</div>
                  <div className="text-gray-600 font-medium">いつでも利用可能</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentView === 'search' && (
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={handleBackToHome}
              className="flex items-center text-gray-600 hover:text-black mb-8 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              ホームに戻る
            </button>
            <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-soft">
              <SearchForm 
                onSearchComplete={handleSearchComplete} 
                initialData={searchFormData}
                onFormDataChange={setSearchFormData}
                initialStep={searchFormStep}
                onStepChange={setSearchFormStep}
              />
            </div>
          </div>
        </div>
      )}

      {currentView === 'results' && searchRequest && (
        <ResultsList
          searchRequest={searchRequest}
          restaurants={restaurants}
          onBackToSearch={handleBackToSearch}
        />
      )}
    </main>
  )
}
