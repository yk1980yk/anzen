import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import EditForm from './EditForm';

export default async function EditDangerAreaPage({ params }: { params: { id: string } }) {
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
      <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>危険エリアを編集</h1>
      <EditForm area={area} />
    </div>
  );
}
