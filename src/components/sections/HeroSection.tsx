/**
 * ヒーローセクション
 * 仕様書: specs/01-top-page.md
 */

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-gray-900 to-gray-800 py-20 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* キャッチコピー */}
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            最高のデスク環境を
            <br />
            見つけよう
          </h1>

          {/* サブタイトル */}
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300">
            SNS・YouTube・Amazonのデータをもとに、
            <br className="hidden sm:inline" />
            本当に人気のデスクアイテムをランキング形式でお届け
          </p>

          {/* CTA */}
          <div className="mt-10 flex justify-center gap-4">
            <a
              href="#ranking"
              className="rounded-md bg-white px-8 py-3 text-base font-semibold text-gray-900 shadow-sm transition-colors hover:bg-gray-100"
            >
              ランキングを見る
            </a>
            <a
              href="#categories"
              className="rounded-md border border-white/20 bg-white/10 px-8 py-3 text-base font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              カテゴリから探す
            </a>
          </div>
        </div>
      </div>

      {/* 装飾 */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl" />
      </div>
    </section>
  )
}
