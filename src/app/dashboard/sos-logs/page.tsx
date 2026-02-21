import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

import Card from '@/components/ui/Card';

export default async function SosLogsPage() {
  const supabase = createServerComponentClient({ cookies });

  const { data: logs, error } = await supabase
    .from('sos_logs')
    .select(`
      id,
      created_at,
      latitude,
      longitude,
      message,
      user_id,
      profiles ( username )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    return <div>データの取得に失敗しました。</div>;
  }

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>SOS ログ一覧</h1>

      <div style={{ marginTop: '24px' }}>
        {logs?.length === 0 && <p>SOS ログはまだありません。</p>}

        {logs?.map((log) => (
          <Card key={log.id}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>
              {log.profiles?.username ?? '不明なユーザー'}
            </h2>

            <p>メッセージ: {log.message}</p>
            <p>緯度: {log.latitude}</p>
            <p>経度: {log.longitude}</p>

            <p style={{ marginTop: '8px', color: '#666' }}>
              送信日時: {new Date(log.created_at).toLocaleString('ja-JP')}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
