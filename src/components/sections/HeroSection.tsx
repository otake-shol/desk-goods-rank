/**
 * ヒーローセクション（ガジェット系デザイン - ミニマル版）
 * 仕様書: specs/01-top-page.md
 */

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-6 sm:py-8">
      {/* 背景グラデーション */}
      <div className="absolute inset-0 bg-[#0a0a0f]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f]" />
        <div className="absolute -left-40 -top-40 h-[300px] w-[300px] rounded-full bg-[#00d4ff]/10 blur-[80px]" />
        <div className="absolute -right-20 top-0 h-[200px] w-[200px] rounded-full bg-[#7c3aed]/10 blur-[60px]" />
      </div>

      {/* コンテンツ */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          {/* 左側: テキスト */}
          <div>
            <p className="mb-1 text-xs text-[#00d4ff] font-medium tracking-wider">
              デスク・グッズ・ランク
            </p>
            <h1 className="font-mono text-lg font-bold tracking-tight text-white sm:text-xl">
              デスクツアーで見つけた、
              <br className="sm:hidden" />
              本当に使われてるモノ
            </h1>
          </div>

          {/* 右側: CTA */}
          <div className="flex items-center gap-3">
            <a
              href="#categories"
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all hover:border-[#00d4ff]/50 hover:bg-white/10"
            >
              カテゴリ
            </a>
            <a
              href="#ranking"
              className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-lg bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] px-4 py-2 text-sm font-semibold text-white transition-all hover:shadow-[0_0_20px_rgba(0,212,255,0.4)]"
            >
              <span className="relative z-10">ランキング</span>
              <svg
                className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
