"use client";

import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { QRCodeCanvas } from "qrcode.react";
import { useRouter } from "next/navigation";

export default function GroupDetailPage({ params }: any) {
  // Next.js 15: params は use() で unwrap する
  const { groupId } = use(params);
  const router = useRouter();

  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // 名前編集
  const [showEditName, setShowEditName] = useState(false);
  const [newName, setNewName] = useState("");

  // ログイン中のユーザー
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user);

      const { data: groupData } = await supabase
        .from("groups")
        .select("*")
        .eq("id", groupId)
        .single();

      setGroup(groupData);

      const { data: memberData } = await supabase
        .from("group_members")
        .select("*, user:auth.users(*)")
        .eq("group_id", groupId);

      setMembers(memberData || []);
      setLoading(false);
    };

    fetchData();
  }, [groupId]);

  if (loading) return <p style={{ padding: 20 }}>読み込み中...</p>;
  if (!group) return <p style={{ padding: 20 }}>グループが見つかりません。</p>;

  const handleCopy = () => {
    navigator.clipboard.writeText(group.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const joinUrl = `${window.location.origin}/join?code=${group.invite_code}`;

  const handleSaveName = async () => {
    if (!newName.trim()) return;

    await supabase.from("groups").update({ name: newName }).eq("id", groupId);

    setGroup({ ...group, name: newName });
    setShowEditName(false);
  };

  // 役割変更
  const toggleRole = async (member: any) => {
    const newRole = member.role === "parent" ? "child" : "parent";

    await supabase
      .from("group_members")
      .update({ role: newRole })
      .eq("id", member.id);

    setMembers(
      members.map((m) =>
        m.id === member.id ? { ...m, role: newRole } : m
      )
    );
  };

  // メンバー削除
  const removeMember = async (member: any) => {
    await supabase.from("group_members").delete().eq("id", member.id);

    setMembers(members.filter((m) => m.id !== member.id));
  };

  // グループ削除
  const deleteGroup = async () => {
    const confirmDelete = window.confirm(
      "本当にこのグループを削除しますか？（元に戻せません）"
    );
    if (!confirmDelete) return;

    await supabase.from("groups").delete().eq("id", groupId);

    router.push("/groups");
  };

  // 現在のユーザーが parent かどうか
  const isCurrentUserParent = members.some(
    (m) => m.user_id === currentUser?.id && m.role === "parent"
  );

  return (
    <div style={{ padding: 20 }}>
      <h1>
        {group.name || "名前未設定のグループ"}
        <button
          onClick={() => {
            setNewName(group.name || "");
            setShowEditName(true);
          }}
          style={{ marginLeft: 10 }}
        >
          名前を編集
        </button>
      </h1>

      <p>タイプ：{group.type}</p>

      <h2>招待コード</h2>
      <div
        style={{
          padding: "10px",
          border: "1px solid #ccc",
          display: "inline-block",
          marginBottom: "10px",
        }}
      >
        <strong>{group.invite_code}</strong>
      </div>

      <button onClick={handleCopy} style={{ marginLeft: 10 }}>
        {copied ? "コピーしました！" : "コピー"}
      </button>

      <button
        onClick={() => setShowQR(true)}
        style={{ marginLeft: 10, padding: "6px 12px" }}
      >
        QRコードを表示
      </button>

      {/* QRコードモーダル */}
      {showQR && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          onClick={() => setShowQR(false)}
        >
          <div
            style={{
              background: "#fff",
              padding: 20,
              borderRadius: 8,
              textAlign: "center",
            }}
          >
            <h3>QRコード</h3>
            <QRCodeCanvas value={joinUrl} size={200} />
            <p style={{ marginTop: 10 }}>タップで閉じる</p>
          </div>
        </div>
      )}

      {/* 名前編集モーダル */}
      {showEditName && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          onClick={() => setShowEditName(false)}
        >
          <div
            style={{
              background: "#fff",
              padding: 20,
              borderRadius: 8,
              textAlign: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>グループ名を編集</h3>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={{
                padding: 10,
                width: "200px",
                border: "1px solid #ccc",
              }}
            />
            <div style={{ marginTop: 15 }}>
              <button onClick={handleSaveName} style={{ marginRight: 10 }}>
                保存
              </button>
              <button onClick={() => setShowEditName(false)}>キャンセル</button>
            </div>
          </div>
        </div>
      )}

      <h2 style={{ marginTop: 30 }}>メンバー一覧</h2>
      <ul>
        {members.map((m) => (
          <li key={m.id} style={{ marginBottom: 8 }}>
            {m.user?.email || "ユーザー"}（{m.role}）

            {/* 役割変更 */}
            <button
              onClick={() => toggleRole(m)}
              style={{ marginLeft: 10 }}
            >
              役割を変更
            </button>

            {/* 削除（parent だけ、かつ自分以外） */}
            {isCurrentUserParent && m.user_id !== currentUser?.id && (
              <button
                onClick={() => removeMember(m)}
                style={{ marginLeft: 10, color: "red" }}
              >
                削除
              </button>
            )}
          </li>
        ))}
      </ul>

      {/* グループ削除 */}
      {isCurrentUserParent && (
        <button
          onClick={deleteGroup}
          style={{
            marginTop: 30,
            padding: "10px 20px",
            background: "red",
            color: "white",
            border: "none",
            borderRadius: 4,
          }}
        >
          グループを削除
        </button>
      )}
    </div>
  );
}
