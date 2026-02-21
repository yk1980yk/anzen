import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

import Card from '@/components/ui/Card';

export default async function UsersPage() {
  const supabase = createServerComponentClient({ cookies });

  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, username, email, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    return <div>ユーザー情報の取得に失敗しました。</div>;
  }

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>ユーザー一覧</h1>

      <div style={{ marginTop: '24px' }}>
        {users?.length === 0 && <p>ユーザーがまだ登録されていません。</p>}

        {users?.map((user) => (
          <Card key={user.id}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>
              {user.username ?? '名前未設定'}
            </h2>

            <p>メール: {user.email}</p>

            <p style={{ marginTop: '8px', color: '#666' }}>
              登録日: {new Date(user.created_at).toLocaleString('ja-JP')}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
