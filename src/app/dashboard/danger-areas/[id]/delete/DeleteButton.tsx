'use client';

import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useState } from 'react';

import Button from '@/components/ui/Button';

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const ok = confirm('本当に削除しますか？');
    if (!ok) return;

    setLoading(true);

    const { error } = await supabase
      .from('danger_areas')
      .delete()
      .eq('id', id);

    setLoading(false);

    if (error) {
      alert('削除に失敗しました: ' + error.message);
      return;
    }

    router.push('/dashboard/danger-areas');
  };

  return (
    <Button variant="danger" onClick={handleDelete} disabled={loading}>
      {loading ? '削除中…' : '削除する'}
    </Button>
  );
}
