'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function NewDangerAreaPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [level, setLevel] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('danger_areas').insert({
      title,
      description,
      latitude: Number(latitude),
      longitude: Number(longitude),
      level: Number(level),
    });

    setLoading(false);

    if (error) {
      alert('登録に失敗しました: ' + error.message);
      return;
    }

    router.push('/dashboard/danger-areas');
  };

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>危険エリアを追加</h1>

      <Card>
        <form onSubmit={handleSubmit}>
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
            {loading ? '登録中…' : '登録する'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
