'use client'

export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">ANZEN ダッシュボード</h1>
      <p className="mb-6">ログイン成功！ここから管理画面を作っていこう。</p>

      <ul className="space-y-3">
        <li>
          <a href="/dashboard/danger-areas" className="text-blue-600 underline">
            危険エリア一覧
          </a>
        </li>
        <li>
          <a href="/dashboard/danger-areas/new" className="text-blue-600 underline">
            危険エリアを追加
          </a>
        </li>
        <li>
          <a href="/dashboard/users" className="text-blue-600 underline">
            ユーザー一覧
          </a>
        </li>
        <li>
          <a href="/dashboard/admins" className="text-blue-600 underline">
            管理者設定
          </a>
        </li>
      </ul>
    </div>
  )
}
