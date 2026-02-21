import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default async function DangerAreasPage() {
  const supabase = createServerComponentClient({ cookies });

  const { data: areas, error } = await supabase
    .from('danger_areas')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    return <div>データの取得に失敗しました。</div>;
  }

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>危険エリア一覧</h1>

      <div style={{ marginTop: '16px' }}>
        <Link href="/dashboard/danger-areas/new">
          <Button variant="primary">＋ 新規追加</Button>
        </Link>
      </div>

      <div style={{ marginTop: '24px' }}>
        {areas?.length === 0 && <p>まだ危険エリアが登録されていません。</p>}

        {areas?.map((area) => (
          <Card key={area.id}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>{area.title}</h2>
            <p>{area.description}</p>
            <p>緯度: {area.latitude}</p>
            <p>経度: {area.longitude}</p>
            <p>レベル: {area.level}</p>

            <div style={{ marginTop: '12px', display: 'flex', gap: '12px' }}>
              <Link href={`/dashboard/danger-areas/${area.id}/edit`}>
                <Button variant="secondary">編集</Button>
              </Link>

              <Link href={`/dashboard/danger-areas/${area.id}/delete`}>
                <Button variant="danger">削除</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
