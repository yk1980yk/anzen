import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Card from '@/components/ui/Card';
import DeleteButton from './DeleteButton';

export default async function DeleteDangerAreaPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies });

  const { data: area, error } = await supabase
    .from('danger_areas')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !area) {
    return <div>データが見つかりませんでした。</div>;
  }

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
        危険エリアを削除
      </h1>

      <Card>
        <p>以下の危険エリアを本当に削除しますか？</p>

        <div style={{ marginTop: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>{area.title}</h2>
          <p>{area.description}</p>
          <p>緯度: {area.latitude}</p>
          <p>経度: {area.longitude}</p>
          <p>レベル: {area.level}</p>
        </div>

        <div style={{ marginTop: '24px' }}>
          <DeleteButton id={area.id} />
        </div>
      </Card>
    </div>
  );
}
