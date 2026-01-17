/**
 * ランキングロジック説明ページ
 */

import { Metadata } from 'next'
import Link from 'next/link'
import { Header, Footer } from '@/components'

export const metadata: Metadata = {
  title: 'ランキングの仕組み',
  description:
    'デスクグッズランキングのスコア算出方法を解説。YouTube・noteなど複数のソースからデータを収集し、デスクグッズのランキングを算出しています。',
  openGraph: {
    title: 'ランキングの仕組み | デスクグッズランキング',
    description:
      'デスクグッズランキングのスコア算出方法を解説。複数のデータソースからランキングを算出。',
    url: '/about',
  },
}

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0f]">
      <Header />

      <main className="flex-1">
        {/* ヒーロー */}
        <section className="border-b border-white/10 bg-gradient-to-b from-[#12121a] to-[#0a0a0f] py-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00d4ff]/20">
                <svg className="h-5 w-5 text-[#00d4ff]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                ランキングの仕組み
              </h1>
            </div>
            <p className="text-[#8888a0] text-lg">
              デスクグッズランキングでは、デスクツアー動画や記事から<br className="hidden sm:block" />
              実際に使われているアイテムを収集・分析しています。
            </p>
          </div>
        </section>

        {/* データソース */}
        <section className="py-12 border-b border-white/10">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7c3aed]/20 text-[#7c3aed]">1</span>
              データソース
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* YouTube */}
              <div className="rounded-xl border border-white/10 bg-[#1a1a24] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ff0000]/20">
                    <svg className="h-5 w-5 text-[#ff0000]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white">YouTube</h3>
                </div>
                <p className="text-[#8888a0] text-sm mb-4">
                  デスクツアー・レビュー動画を分析。説明欄のAmazonリンクからアイテムを抽出しています。
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#ff0000]/10 px-3 py-1 text-xs text-[#ff0000]">デスクツアー</span>
                  <span className="rounded-full bg-[#ff0000]/10 px-3 py-1 text-xs text-[#ff0000]">レビュー動画</span>
                </div>
              </div>

              {/* note */}
              <div className="rounded-xl border border-white/10 bg-[#1a1a24] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#41c9b4]/20">
                    <svg className="h-5 w-5 text-[#41c9b4]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white">note</h3>
                </div>
                <p className="text-[#8888a0] text-sm mb-4">
                  デスクツアー・ガジェット紹介記事から商品の言及を抽出。記事数とスキ数を分析。
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#41c9b4]/10 px-3 py-1 text-xs text-[#41c9b4]">記事数</span>
                  <span className="rounded-full bg-[#41c9b4]/10 px-3 py-1 text-xs text-[#41c9b4]">スキ数</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* スコア算出 */}
        <section className="py-12 border-b border-white/10">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7c3aed]/20 text-[#7c3aed]">2</span>
              スコア算出
            </h2>

            <div className="rounded-xl border border-white/10 bg-[#1a1a24] p-6 mb-6">
              <h3 className="text-lg font-bold text-white mb-4">評価の基準</h3>
              <p className="text-[#8888a0] text-sm mb-6">
                各アイテムのスコアは、以下の要素を総合的に評価して算出しています。
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-lg bg-white/5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff0000]/20 shrink-0">
                    <svg className="h-4 w-4 text-[#ff0000]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">YouTube での露出</h4>
                    <p className="text-[#8888a0] text-sm">デスクツアー動画での紹介回数、動画の再生数など</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg bg-white/5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#41c9b4]/20 shrink-0">
                    <span className="text-[#41c9b4] text-sm font-bold">n</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">note での言及</h4>
                    <p className="text-[#8888a0] text-sm">デスクツアー記事での紹介回数、記事のスキ数など</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg bg-white/5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff9900]/20 shrink-0">
                    <svg className="h-4 w-4 text-[#ff9900]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.493.126.11.19.03.404-.24.638-.39.34-.863.696-1.422 1.07a20.49 20.49 0 01-8.31 2.62c-3.98.403-7.73-.378-11.25-2.34-.192-.108-.27-.234-.235-.378.032-.135.133-.24.3-.318l-.01.002z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Amazon での評価</h4>
                    <p className="text-[#8888a0] text-sm">ベストセラーランキング、レビュー評価など</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 更新頻度 */}
        <section className="py-12 border-b border-white/10">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7c3aed]/20 text-[#7c3aed]">3</span>
              データ更新
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-[#1a1a24] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00ff88]/20">
                    <svg className="h-5 w-5 text-[#00ff88]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white">定期更新</h3>
                </div>
                <p className="text-[#8888a0] text-sm">
                  スコアデータは定期的に更新しています。
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#1a1a24] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#7c3aed]/20">
                    <svg className="h-5 w-5 text-[#7c3aed]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white">新規アイテム追加</h3>
                </div>
                <p className="text-[#8888a0] text-sm">
                  複数のソースからデスク関連アイテムを随時追加しています。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* アイテム発見ソース */}
        <section className="py-12 border-b border-white/10">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7c3aed]/20 text-[#7c3aed]">4</span>
              アイテム取得元
            </h2>
            <p className="text-[#8888a0] mb-6">
              以下のソースからデスク環境に関連するアイテムを収集しています。
            </p>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {/* YouTube */}
              <div className="rounded-xl border border-white/10 bg-[#1a1a24] p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff0000]/20">
                    <svg className="h-4 w-4 text-[#ff0000]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-white">YouTube</h3>
                </div>
                <p className="text-[#8888a0] text-xs">
                  デスクツアー動画の説明欄からリンク抽出
                </p>
              </div>

              {/* note.com */}
              <div className="rounded-xl border border-white/10 bg-[#1a1a24] p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#41c9b4]/20">
                    <span className="text-[#41c9b4] text-sm font-bold">n</span>
                  </div>
                  <h3 className="text-sm font-bold text-white">note.com</h3>
                </div>
                <p className="text-[#8888a0] text-xs">
                  デスクツアー記事からAmazonリンクを抽出
                </p>
              </div>

              {/* Zenn */}
              <div className="rounded-xl border border-white/10 bg-[#1a1a24] p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3ea8ff]/20">
                    <span className="text-[#3ea8ff] text-sm font-bold">Z</span>
                  </div>
                  <h3 className="text-sm font-bold text-white">Zenn</h3>
                </div>
                <p className="text-[#8888a0] text-xs">
                  エンジニア向けデスク環境・ガジェット記事
                </p>
              </div>

              {/* はてなブログ */}
              <div className="rounded-xl border border-white/10 bg-[#1a1a24] p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00a4de]/20">
                    <span className="text-[#00a4de] text-sm font-bold">B!</span>
                  </div>
                  <h3 className="text-sm font-bold text-white">はてなブログ</h3>
                </div>
                <p className="text-[#8888a0] text-xs">
                  デスクツアー・ガジェット紹介記事
                </p>
              </div>

              {/* Amazon ベストセラー */}
              <div className="rounded-xl border border-white/10 bg-[#1a1a24] p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff9900]/20">
                    <svg className="h-4 w-4 text-[#ff9900]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.493.126.11.19.03.404-.24.638-.39.34-.863.696-1.422 1.07a20.49 20.49 0 01-8.31 2.62c-3.98.403-7.73-.378-11.25-2.34-.192-.108-.27-.234-.235-.378.032-.135.133-.24.3-.318l-.01.002z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-white">Amazon</h3>
                </div>
                <p className="text-[#8888a0] text-xs">
                  カテゴリ別ベストセラーランキング
                </p>
              </div>

              {/* Makuake */}
              <div className="rounded-xl border border-white/10 bg-[#1a1a24] p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e60012]/20">
                    <span className="text-[#e60012] text-sm font-bold">M</span>
                  </div>
                  <h3 className="text-sm font-bold text-white">Makuake</h3>
                </div>
                <p className="text-[#8888a0] text-xs">
                  クラウドファンディングの話題製品
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-xl font-bold text-white mb-4">
              ランキングをチェックする
            </h2>
            <p className="text-[#8888a0] mb-6">
              デスクツアーで実際に使われている人気アイテムをチェックして、あなたのデスク環境をアップグレードしましょう。
            </p>
            <Link
              href="/ranking"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#00d4ff] px-8 py-4 text-sm font-bold text-white transition-all hover:opacity-90"
            >
              全アイテムランキングを見る
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
