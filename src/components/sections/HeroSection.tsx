/**
 * ヒーローセクション（ガジェット系デザイン）
 * 仕様書: specs/01-top-page.md
 */

export function HeroSection() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* 背景グラデーション */}
      <div className="absolute inset-0 bg-[#0a0a0f]">
        {/* メイングラデーション */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f]" />

        {/* ネオングロー - 左上 */}
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#00d4ff]/20 blur-[120px]" />

        {/* ネオングロー - 右下 */}
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#7c3aed]/20 blur-[120px]" />

        {/* ネオングロー - 中央 */}
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff00aa]/10 blur-[100px]" />

        {/* グリッドパターン */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* コンテンツ */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        {/* バッジ */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#00d4ff]/30 bg-[#00d4ff]/10 px-4 py-2 text-sm text-[#00d4ff]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00d4ff] opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00d4ff]"></span>
          </span>
          SNS・YouTube・Amazonデータをリアルタイム分析
        </div>

        {/* メインタイトル */}
        <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          <span className="text-white">最高の</span>
          <br />
          <span className="gradient-text">デスク環境</span>
          <span className="text-white">を</span>
          <br />
          <span className="text-white">見つけよう</span>
        </h1>

        {/* サブタイトル */}
        <p className="mx-auto mb-10 max-w-2xl text-lg text-[#8888a0] sm:text-xl">
          本当に人気のデスクアイテムを
          <br className="sm:hidden" />
          ランキング形式でお届け
        </p>

        {/* CTA ボタン */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#ranking"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] px-8 py-4 text-base font-semibold text-white transition-all hover:shadow-[0_0_30px_rgba(0,212,255,0.4)]"
          >
            <span className="relative z-10">ランキングを見る</span>
            <svg
              className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
            {/* ホバー時のシャイン効果 */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
          </a>

          <a
            href="#categories"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-[#00d4ff]/50 hover:bg-white/10"
          >
            カテゴリから探す
          </a>
        </div>

        {/* スタッツ */}
        <div className="mt-16 grid grid-cols-3 gap-8">
          {[
            { value: '10+', label: '厳選アイテム' },
            { value: '3', label: 'カテゴリ' },
            { value: '100%', label: 'データ駆動' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-[#00d4ff] sm:text-4xl">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-[#8888a0]">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* スクロールインジケーター */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-[#8888a0]">Scroll</span>
          <div className="h-12 w-6 rounded-full border border-white/20">
            <div className="mx-auto mt-2 h-2 w-1 animate-bounce rounded-full bg-[#00d4ff]" />
          </div>
        </div>
      </div>
    </section>
  )
}
