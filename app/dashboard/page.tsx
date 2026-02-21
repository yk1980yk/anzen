'use client'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8 max-w-2xl mx-auto space-y-6">

      {/* タイトル */}
      <h1 className="text-2xl font-bold">ANZEN ダッシュボード</h1>
      <p className="text-gray-600">ログイン成功！ここから管理画面を作っていこう。</p>

      {/* メニューカード */}
      <div className="space-y-4">

        <a
          href="/dashboard/danger-areas"
          className="block bg-white p-4 rounded-soft shadow-soft hover:shadow-strong transition"
        >
          <h2 className="text-lg font-semibold">危険エリア一覧</h2>
          <p className="text-sm text-gray-600">登録済みの危険エリアを確認できます</p>
        </a>

        <a
          href="/dashboard/danger-areas/new"
          className="block bg-white p-4 rounded-soft shadow-soft hover:shadow-strong transition"
        >
          <h2 className="text-lg font-semibold">危険エリアを追加</h2>
          <p className="text-sm text-gray-600">新しい危険エリアを登録します</p>
        </a>

        <a
          href="/dashboard/users"
          className="block bg-white p-4 rounded-soft shadow-soft hover:shadow-strong transition"
        >
          <h2 className="text-lg font-semibold">ユーザー一覧</h2>
          <p className="text-sm text-gray-600">アプリ利用者の一覧を確認できます</p>
        </a>

        <a
          href="/dashboard/admins"
          className="block bg-white p-4 rounded-soft shadow-soft hover:shadow-strong transition"
        >
          <h2 className="text-lg font-semibold">管理者設定</h2>
          <p className="text-sm text-gray-600">管理者アカウントの設定を行います</p>
        </a>

      </div>
    </div>
  )
}
