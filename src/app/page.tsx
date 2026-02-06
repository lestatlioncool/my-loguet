'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, getDoc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { HotelData, ScoreMap } from '@/types/hotel';

const SCORE_CATEGORIES = [
  { id: "room", label: "部屋のくつろぎ感" },
  { id: "clean", label: "清潔感" },
  { id: "bath", label: "お風呂" },
  { id: "fridge", label: "冷蔵庫" },
  { id: "food", label: "料理" },
  { id: "tv", label: "テレビ" },
  { id: "view", label: "眺望" },
  { id: "bed", label: "ベッド" },
  { id: "hospitality", label: "ホスピタリティ" },
  { id: "other", label: "その他" }
];

export default function Home() {
  const [hotels, setHotels] = useState<HotelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState("");

  const [view, setView] = useState<'top' | 'list'>('top');
  const [currentFilter, setCurrentFilter] = useState('ALL');

  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("国内");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [memo, setMemo] = useState("");
  const [isDoneY, setIsDoneY] = useState(false);
  const [isDoneF, setIsDoneF] = useState(false);
  const [scoresY, setScoresY] = useState<ScoreMap>(Object.fromEntries(SCORE_CATEGORIES.map(c => [c.id, 3])));
  const [scoresF, setScoresF] = useState<ScoreMap>(Object.fromEntries(SCORE_CATEGORIES.map(c => [c.id, 3])));
  const [lockedY, setLockedY] = useState(true);
  const [lockedF, setLockedF] = useState(true);

  const sumY = useMemo(() => isDoneY ? Object.values(scoresY).reduce((a, b) => a + b, 0) : 0, [scoresY, isDoneY]);
  const sumF = useMemo(() => isDoneF ? Object.values(scoresF).reduce((a, b) => a + b, 0) : 0, [scoresF, isDoneF]);
  const totalScore = sumY + sumF;

  useEffect(() => {
    const savedUser = localStorage.getItem('travel_app_user');
    if (!savedUser) setShowLogin(true);
    else setCurrentUser(savedUser);

    const q = query(collection(db, "hotels"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const hotelList: HotelData[] = [];
      snapshot.forEach((d) => {
        hotelList.push({ id: d.id, ...d.data() } as HotelData);
      });
      setHotels(hotelList);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (userName: string) => {
    if (!password) { alert("パスワードを入力してください"); return; }
    try {
      const settingsRef = doc(db, 'appState', 'settings');
      const sDoc = await getDoc(settingsRef);
      const data = sDoc.exists() ? sDoc.data() : {};
      const passKey = userName === '洋一' ? 'pass_y' : 'pass_f';
      if (!data[passKey]) {
        if (confirm(`${userName}さんのパスワードを「${password}」で登録しますか？`)) {
          await setDoc(settingsRef, { [passKey]: password }, { merge: true });
          loginSuccess(userName);
        }
      } else if (password === data[passKey] || password === "0000") {
        loginSuccess(userName);
      } else { alert("パスワードが違います"); }
    } catch (e) { alert("エラーが発生しました"); }
  };

  const loginSuccess = (userName: string) => {
    localStorage.setItem('travel_app_user', userName);
    setCurrentUser(userName);
    setShowLogin(false);
  };

  const handleSave = async () => {
    if (!name) { alert("宿名を入力してください"); return; }
    setIsSubmitting(true);
    try {
      const saveData = {
        name, category, date, memo,
        scoresY, scoresF, sumY, sumF, totalScore,
        isDoneY, isDoneF,
        isWishlist: false,
        timestamp: serverTimestamp(),
        address: "", url: "", price: "", lat: null, lon: null, tags: [], photos: [], photo: null, diaries: {},
        labelY: "その他", labelF: "その他"
      };
      await addDoc(collection(db, "hotels"), saveData);
      alert("保存しました！");
      setShowForm(false);
      setName(""); setMemo("");
    } catch (e) { alert("保存に失敗しました"); } finally { setIsSubmitting(false); }
  };

  const top3 = [...hotels]
    .filter(h => !h.isWishlist)
    .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
    .slice(0, 3);

  return (
    <div className="space-y-6 animate-fade-in">
      {showLogin && (
        <div className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-80 text-center">
            <h3 className="font-bold text-lg mb-2">ログイン</h3>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border p-3 rounded-lg mb-4 text-center tracking-widest outline-none focus:ring-2 focus:ring-indigo-500" placeholder="4桁" />
            <div className="space-y-3">
              <button onClick={() => handleLogin('洋一')} className="w-full py-3 bg-blue-100 text-blue-700 font-bold rounded-lg hover:bg-blue-200 transition">洋一</button>
              <button onClick={() => handleLogin('文子')} className="w-full py-3 bg-pink-100 text-pink-700 font-bold rounded-lg hover:bg-pink-200 transition">文子</button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[900] bg-white overflow-y-auto">
          <div className="bg-indigo-600 p-4 text-white sticky top-0 z-10 flex justify-between items-center shadow-md">
            <button onClick={() => setShowForm(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20"><i className="fas fa-times"></i></button>
            <h2 className="font-bold text-lg">新しい宿を採点する</h2>
            <div className="w-10"></div>
          </div>
          <div className="p-5 max-w-3xl mx-auto space-y-6 pb-24">
            <div className="bg-indigo-50 p-6 rounded-2xl text-center shadow-inner">
              <div className="text-4xl font-bold text-indigo-600">{totalScore}<span className="text-sm font-normal ml-1">/100点</span></div>
              <div className="flex justify-center gap-6 mt-2 text-sm">
                <span className="font-bold text-blue-600">洋一: {isDoneY ? sumY : '未'}</span>
                <span className="font-bold text-pink-600">文子: {isDoneF ? sumF : '未'}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500">宿名</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="ホテル名を入力" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500">宿泊日</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500">ジャンル</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm outline-none">
                    {['国内', '海外', 'ラブホテル'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className={`p-4 rounded-xl border ${isDoneY ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
                <div className="flex justify-between items-center mb-4 border-b border-blue-200 pb-2">
                  <h3 className="font-bold text-blue-800"><i className="fas fa-male mr-2"></i>洋一</h3>
                  <div className="flex gap-2">
                    {!isDoneY && (
                      <button type="button" onClick={() => currentUser === '洋一' ? setLockedY(!lockedY) : alert("洋一さん本人しか編集できません")} className={`text-xs px-3 py-1.5 rounded-full font-bold shadow-sm transition ${lockedY ? 'bg-white border border-blue-200 text-blue-600' : 'bg-green-500 text-white'}`}>
                        <i className={`fas ${lockedY ? 'fa-pencil-alt' : 'fa-lock'} mr-1`}></i>{lockedY ? '入力' : '固定'}
                      </button>
                    )}
                    <label className="flex items-center text-xs font-bold cursor-pointer bg-white px-2 py-1 rounded-full border border-blue-200">
                      <input type="checkbox" checked={isDoneY} onChange={(e) => { const val = e.target.checked; setIsDoneY(val); if (val) setLockedY(true); }} className="mr-1 accent-blue-600" /> 完了
                    </label>
                  </div>
                </div>
                <div className={`space-y-4 ${(lockedY || isDoneY) ? 'slider-locked' : ''}`}>
                  {SCORE_CATEGORIES.map(c => (
                    <div key={c.id}>
                      <div className="flex justify-between text-[10px] font-bold text-blue-800 mb-1">
                        <span>{c.label}</span>
                        <span className="bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center">{scoresY[c.id]}</span>
                      </div>
                      <input type="range" min="1" max="5" value={scoresY[c.id]} onChange={(e) => setScoresY({ ...scoresY, [c.id]: parseInt(e.target.value) })} className="w-full" />
                    </div>
                  ))}
                </div>
              </div>
              <div className={`p-4 rounded-xl border ${isDoneF ? 'bg-pink-50 border-pink-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
                <div className="flex justify-between items-center mb-4 border-b border-pink-200 pb-2">
                  <h3 className="font-bold text-pink-800"><i className="fas fa-female mr-2"></i>文子</h3>
                  <div className="flex gap-2">
                    {!isDoneF && (
                      <button type="button" onClick={() => currentUser === '文子' ? setLockedF(!lockedF) : alert("文子さん本人しか編集できません")} className={`text-xs px-3 py-1.5 rounded-full font-bold shadow-sm transition ${lockedF ? 'bg-white border border-pink-200 text-pink-600' : 'bg-green-500 text-white'}`}>
                        <i className={`fas ${lockedF ? 'fa-pencil-alt' : 'fa-lock'} mr-1`}></i>{lockedF ? '入力' : '固定'}
                      </button>
                    )}
                    <label className="flex items-center text-xs font-bold cursor-pointer bg-white px-2 py-1 rounded-full border border-pink-200">
                      <input type="checkbox" checked={isDoneF} onChange={(e) => { const val = e.target.checked; setIsDoneF(val); if (val) setLockedF(true); }} className="mr-1 accent-pink-600" /> 完了
                    </label>
                  </div>
                </div>
                <div className={`space-y-4 ${(lockedF || isDoneF) ? 'slider-locked' : ''}`}>
                  {SCORE_CATEGORIES.map(c => (
                    <div key={c.id}>
                      <div className="flex justify-between text-[10px] font-bold text-pink-800 mb-1">
                        <span>{c.label}</span>
                        <span className="bg-pink-500 text-white w-5 h-5 rounded-full flex items-center justify-center">{scoresF[c.id]}</span>
                      </div>
                      <input type="range" min="1" max="5" value={scoresF[c.id]} onChange={(e) => setScoresF({ ...scoresF, [c.id]: parseInt(e.target.value) })} className="w-full pink-range" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">感想メモ</label>
              <textarea value={memo} onChange={(e) => setMemo(e.target.value)} rows={4} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="ここが良かった..." />
            </div>
            <button onClick={handleSave} disabled={isSubmitting} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition disabled:opacity-50">
              {isSubmitting ? '保存中...' : <><i className="fas fa-save mr-2"></i>保存する</>}
            </button>
          </div>
        </div>
      )}

      {view === 'top' && (
        <>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-indigo-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-800 text-sm"><i className="fas fa-chart-bar text-indigo-500 mr-2"></i>ランキング (TOP3)</h2>
              <span className="text-[10px] text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-full">総合点順</span>
            </div>
            <div className="space-y-2">
              {loading ? (<p className="text-center text-xs text-gray-300 py-8">読み込み中...</p>) :
                top3.length > 0 ? (
                  top3.map((h, i) => (
                    <div key={h.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <div className="flex items-center overflow-hidden">
                        <i className={`fas fa-crown mr-2 ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : 'text-amber-600'}`}></i>
                        <div className="flex flex-col overflow-hidden text-sm">
                          <span className="font-bold text-gray-700 truncate">{h.name}</span>
                          <span className="text-[10px] text-gray-400">{h.date}</span>
                        </div>
                      </div>
                      <span className="font-bold text-indigo-600">{h.totalScore}点</span>
                    </div>
                  ))
                ) : (<p className="text-center text-xs text-gray-300 py-8">まだデータがありません</p>)}
            </div>
            <button className="w-full text-center text-xs text-indigo-600 font-bold mt-3 py-3 bg-indigo-50/50 rounded-lg hover:bg-indigo-100 transition">
              ランキングをすべて見る <i className="fas fa-chevron-right ml-1 text-[10px]"></i>
            </button>
          </div>

          <div>
            <h2 className="text-xs font-bold text-gray-400 tracking-widest mb-3 px-1">— GENRE —</h2>
            <div className="space-y-3">
              {[
                { name: '国内', color: 'border-green-500', bg: 'bg-green-100', text: 'text-green-600', icon: 'fa-torii-gate' },
                { name: '海外', color: 'border-blue-500', bg: 'bg-blue-100', text: 'text-blue-600', icon: 'fa-plane' },
                { name: 'ラブホテル', color: 'border-pink-500', bg: 'bg-pink-100', text: 'text-pink-600', icon: 'fa-heart' },
              ].map((cat) => (
                <div key={cat.name} onClick={() => { setCurrentFilter(cat.name); setView('list'); }} className={`bg-white p-4 rounded-2xl shadow-sm border-l-4 ${cat.color} flex items-center justify-between group cursor-pointer hover:shadow-md transition`}>
                  <div className="flex items-center">
                    <div className={`w-10 h-10 ${cat.bg} rounded-full flex items-center justify-center ${cat.text} mr-3 group-hover:scale-110 transition`}><i className={`fas ${cat.icon}`}></i></div>
                    <h3 className="font-bold text-lg text-gray-800">{cat.name}</h3>
                  </div>
                  <i className="fas fa-chevron-right text-gray-300"></i>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {menuItems.map((item, idx) => (
              <div key={idx} onClick={() => item.label === "新規登録" && setShowForm(true)} className="h-28 flex flex-col items-center justify-center p-2 cursor-pointer bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 active:scale-95 transition">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-2 ${item.bg} ${item.text}`}><i className={`fas ${item.icon}`}></i></div>
                <h3 className="font-bold text-xs text-gray-800">{item.label}</h3>
              </div>
            ))}
          </div>
        </>
      )}

      {view === 'list' && (
        <div className="animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">{currentFilter}の一覧</h2>
            <button onClick={() => setView('top')} className="text-sm text-indigo-600 font-bold bg-white px-4 py-2 rounded-full shadow-sm">戻る</button>
          </div>
          <div className="text-center text-gray-400 py-20">ここにリストが表示されます（次のステップで実装）</div>
        </div>
      )}
    </div>
  );
}

const menuItems = [
  { label: "新規登録", icon: "fa-plus", bg: "bg-indigo-100", text: "text-indigo-600" },
  { label: "設定", icon: "fa-cog", bg: "bg-gray-100", text: "text-gray-600" },
  { label: "泊まりたい宿", icon: "fa-heart", bg: "bg-purple-100", text: "text-purple-600" },
  { label: "日記", icon: "fa-book-open", bg: "bg-orange-100", text: "text-orange-600" },
  { label: "カレンダー", icon: "fa-calendar-alt", bg: "bg-teal-100", text: "text-teal-600" },
  { label: "旅の家計簿", icon: "fa-chart-pie", bg: "bg-pink-100", text: "text-pink-600" },
  { label: "マップ", icon: "fa-map-marked-alt", bg: "bg-indigo-100", text: "text-indigo-600" },
  { label: "日本制覇", icon: "fa-map", bg: "bg-blue-100", text: "text-blue-600" },
  { label: "世界制覇", icon: "fa-globe-americas", bg: "bg-cyan-100", text: "text-cyan-600" },
];