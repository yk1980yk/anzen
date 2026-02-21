'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function EditForm({ area }: { area: any }) {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [title, setTitle] = useState(area.title);
  const [description, setDescription] = useState(area.description);
  const [latitude, setLatitude] = useState(area.latitude);
  const [longitude, setLongitude] = useState(area.longitude);
  const [level, setLevel] = useState(area.level);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('danger_areas')
      .update({
        title,
        description,
        latitude: Number(latitude),
        longitude: Number(longitude),
        level: Number(level),
      })
      .eq('id', area.id);

    setLoading(false);

    if (error) {
      alert('更新に失敗しました: ' + error.message);
      return;
    }

    router.push('/dashboard/danger-areas');
  };

  return (
    <Card>
      <form onSubmit={handleUpdate}>
        <Input
          label="タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div style={{ marginBottom: '16px' }}>
          <label className="ui-label">説明</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="ui-input"
            required
          />
        </div>

        <Input
          label="緯度"
          type="number"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
        />

        <Input
          label="経度"
          type="number"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
        />

        <Input
          label="危険レベル（1〜5）"
          type="number"
          value={level}
          onChange={(e) => setLevel(Number(e.target.value))}
        />

        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? '更新中…' : '更新する'}
        </Button>
      </form>
    </Card>
  );
}
