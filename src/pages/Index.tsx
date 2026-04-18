import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

// ─── Types ─────────────────────────────────────────────
type Page = "home" | "feed" | "upload" | "profile" | "search" | "favorites" | "auth" | "watch";

interface Video {
  id: number;
  title: string;
  author: string;
  avatar: string;
  views: string;
  duration: string;
  thumb: string;
  likes: number;
  dislikes: number;
  userVote: "like" | "dislike" | null;
  description: string;
  category: string;
  saved: boolean;
  videoUrl?: string;
}

interface User {
  name: string;
  email: string;
  avatar: string;
  subscribers: number;
  videos: number;
  likes: number;
}

// ─── Mock Data ──────────────────────────────────────────
const COLORS = [
  "from-blue-400 to-blue-600",
  "from-purple-400 to-purple-600",
  "from-pink-400 to-pink-600",
  "from-green-400 to-green-600",
  "from-orange-400 to-orange-600",
  "from-red-400 to-red-600",
  "from-teal-400 to-teal-600",
  "from-indigo-400 to-indigo-600",
];

const ICONS = ["🎬", "🎮", "🎵", "🌍", "🏋️", "🍕", "🚀", "🎨"];

const INITIAL_VIDEOS: Video[] = [];

const CATEGORIES = ["Все", "Технологии", "Образование", "Игры", "Кулинария", "Фитнес", "Путешествия", "Образ жизни", "Программирование"];

// ─── Components ─────────────────────────────────────────

function VideoThumb({ video, size = "md" }: { video: Video; size?: "sm" | "md" | "lg" }) {
  const h = size === "sm" ? "h-24" : size === "lg" ? "h-52" : "h-40";
  return (
    <div className={`relative bg-gradient-to-br ${video.thumb} rounded-2xl overflow-hidden ${h} w-full flex items-center justify-center`}>
      <span className="text-4xl opacity-60">{ICONS[video.id % ICONS.length]}</span>
      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded-md font-semibold">
        {video.duration}
      </div>
    </div>
  );
}

function LikeBar({ video, onVote }: { video: Video; onVote: (id: number, vote: "like" | "dislike") => void }) {
  const total = video.likes + video.dislikes;
  const pct = total > 0 ? (video.likes / total) * 100 : 50;
  const fmt = (n: number) => n >= 1000 ? (n / 1000).toFixed(1) + "К" : String(n);

  return (
    <div className="flex flex-col gap-2 flex-1">
      <div className="flex gap-2">
        <button
          onClick={() => onVote(video.id, "like")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
            video.userVote === "like"
              ? "bg-ios-blue text-white shadow-md shadow-blue-200 dark:shadow-blue-900"
              : "bg-secondary text-foreground hover:bg-ios-blue/10 hover:text-ios-blue"
          }`}
        >
          <Icon name="ThumbsUp" size={15} />
          {fmt(video.likes)}
        </button>
        <button
          onClick={() => onVote(video.id, "dislike")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
            video.userVote === "dislike"
              ? "bg-ios-red text-white shadow-md shadow-red-200 dark:shadow-red-900"
              : "bg-secondary text-foreground hover:bg-ios-red/10 hover:text-ios-red"
          }`}
        >
          <Icon name="ThumbsDown" size={15} />
          {fmt(video.dislikes)}
        </button>
      </div>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-ios-blue to-ios-green rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function VideoCard({ video, onWatch, onVote, onSave }: {
  video: Video;
  onWatch: (v: Video) => void;
  onVote: (id: number, vote: "like" | "dislike") => void;
  onSave: (id: number) => void;
}) {
  return (
    <div className="glass-card overflow-hidden hover-lift animate-fade-in">
      <button onClick={() => onWatch(video)} className="w-full text-left">
        <VideoThumb video={video} size="md" />
      </button>
      <div className="p-4 space-y-3">
        <button onClick={() => onWatch(video)} className="w-full text-left">
          <h3 className="font-semibold text-base leading-snug line-clamp-2">{video.title}</h3>
          <div className="flex items-center gap-2 mt-1.5">
            <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${COLORS[video.id % COLORS.length]} flex items-center justify-center text-white text-xs font-bold`}>
              {video.avatar.charAt(0)}
            </div>
            <span className="text-muted-foreground text-sm">{video.author}</span>
            <span className="text-muted-foreground text-xs ml-auto">{video.views} просм.</span>
          </div>
        </button>
        <div className="flex items-center gap-2">
          <LikeBar video={video} onVote={onVote} />
          <button
            onClick={() => onSave(video.id)}
            className={`ml-1 p-2 rounded-xl transition-all active:scale-90 flex-shrink-0 ${video.saved ? "text-ios-orange bg-orange-100 dark:bg-orange-900/30" : "text-muted-foreground bg-secondary hover:text-ios-orange"}`}
          >
            <Icon name={video.saved ? "Bookmark" : "BookmarkPlus"} size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Pages ──────────────────────────────────────────────

function HomePage({ onNavigate, videos, onWatch, onVote, onSave }: {
  onNavigate: (p: Page) => void;
  videos: Video[];
  onWatch: (v: Video) => void;
  onVote: (id: number, vote: "like" | "dislike") => void;
  onSave: (id: number) => void;
}) {
  const trending = videos.slice(0, 3);
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="glass-card p-6 bg-gradient-to-br from-ios-blue/10 to-ios-purple/10 border-ios-blue/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-ios-blue to-ios-purple flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-900">
            <span className="text-2xl">▶</span>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Vl Video</h1>
            <p className="text-muted-foreground text-sm">Твоя видеоплатформа</p>
          </div>
        </div>
        <p className="text-base text-muted-foreground mb-5 leading-relaxed">
          Публикуй видео, набирай аудиторию, получай лайки от реальных зрителей.
        </p>
        <div className="flex gap-3">
          <button onClick={() => onNavigate("upload")} className="ios-btn flex items-center gap-2">
            <Icon name="Plus" size={16} />
            Загрузить
          </button>
          <button onClick={() => onNavigate("feed")} className="ios-btn-secondary flex items-center gap-2">
            <Icon name="Play" size={16} />
            Смотреть
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">🔥 Последние видео</h2>
          {trending.length > 0 && <button onClick={() => onNavigate("feed")} className="text-ios-blue text-sm font-semibold">Все →</button>}
        </div>
        {trending.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <div className="text-5xl mb-3">🎬</div>
            <p className="font-semibold text-base mb-1">Видео пока нет</p>
            <p className="text-muted-foreground text-sm mb-4">Стань первым — загрузи своё видео!</p>
            <button onClick={() => onNavigate("upload")} className="ios-btn flex items-center gap-2 mx-auto">
              <Icon name="Plus" size={16} />
              Загрузить первое видео
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {trending.map(v => (
              <VideoCard key={v.id} video={v} onWatch={onWatch} onVote={onVote} onSave={onSave} />
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Видео", value: String(videos.length), icon: "Video" },
          { label: "Лайков", value: videos.reduce((s, v) => s + v.likes, 0) > 0 ? String(videos.reduce((s, v) => s + v.likes, 0)) : "0", icon: "Heart" },
          { label: "Сохранено", value: String(videos.filter(v => v.saved).length), icon: "Bookmark" },
        ].map(s => (
          <div key={s.label} className="glass-card p-4 text-center">
            <Icon name={s.icon as Parameters<typeof Icon>[0]["name"]} size={22} className="mx-auto mb-1 text-ios-blue" />
            <div className="text-xl font-black">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeedPage({ videos, onWatch, onVote, onSave }: {
  videos: Video[];
  onWatch: (v: Video) => void;
  onVote: (id: number, vote: "like" | "dislike") => void;
  onSave: (id: number) => void;
}) {
  const [activeCategory, setActiveCategory] = useState("Все");
  const filtered = activeCategory === "Все" ? videos : videos.filter(v => v.category === activeCategory);

  return (
    <div className="space-y-5 animate-fade-in">
      <h2 className="text-2xl font-black">Лента видео</h2>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeCategory === cat
                ? "bg-ios-blue text-white shadow-md shadow-blue-200 dark:shadow-blue-900"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {filtered.map((v, i) => (
          <div key={v.id} style={{ animationDelay: `${i * 0.05}s` }}>
            <VideoCard video={v} onWatch={onWatch} onVote={onVote} onSave={onSave} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SearchPage({ videos, onWatch }: { videos: Video[]; onWatch: (v: Video) => void }) {
  const [query, setQuery] = useState("");
  const results = query.length > 1
    ? videos.filter(v =>
        v.title.toLowerCase().includes(query.toLowerCase()) ||
        v.author.toLowerCase().includes(query.toLowerCase()) ||
        v.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-5 animate-fade-in">
      <h2 className="text-2xl font-black">Поиск</h2>
      <div className="relative">
        <Icon name="Search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          className="ios-input pl-11"
          placeholder="Название, автор, категория..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Icon name="X" size={16} />
          </button>
        )}
      </div>

      {query.length > 1 && results.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Icon name="SearchX" size={48} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">Ничего не найдено</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Найдено: {results.length}</p>
          {results.map(v => (
            <button key={v.id} onClick={() => onWatch(v)} className="w-full text-left glass-card p-4 flex gap-4 hover-lift animate-fade-in">
              <div className={`w-24 h-16 bg-gradient-to-br ${v.thumb} rounded-xl flex-shrink-0 flex items-center justify-center`}>
                <span className="text-2xl opacity-70">{ICONS[v.id % ICONS.length]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm line-clamp-2">{v.title}</h3>
                <p className="text-muted-foreground text-xs mt-1">{v.author} · {v.views} просм.</p>
                <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-secondary rounded-lg">{v.category}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {!query && (
        <div>
          <h3 className="font-semibold mb-3 text-muted-foreground text-sm uppercase tracking-wide">Категории</h3>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.slice(1).map((cat, i) => (
              <button
                key={cat}
                onClick={() => setQuery(cat)}
                className="glass-card p-4 flex items-center gap-3 text-left hover-lift"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${COLORS[i % COLORS.length]} flex items-center justify-center`}>
                  <span className="text-lg">{ICONS[i % ICONS.length]}</span>
                </div>
                <span className="font-semibold text-sm">{cat}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FavoritesPage({ videos, onWatch, onVote, onSave }: {
  videos: Video[];
  onWatch: (v: Video) => void;
  onVote: (id: number, vote: "like" | "dislike") => void;
  onSave: (id: number) => void;
}) {
  const saved = videos.filter(v => v.saved);

  return (
    <div className="space-y-5 animate-fade-in">
      <h2 className="text-2xl font-black">Избранное</h2>
      {saved.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-3xl bg-secondary flex items-center justify-center mx-auto mb-4">
            <Icon name="Bookmark" size={36} className="text-muted-foreground" />
          </div>
          <p className="font-semibold text-lg">Пусто</p>
          <p className="text-muted-foreground text-sm mt-1">Нажми на закладку у видео</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{saved.length} сохранённых</p>
          {saved.map(v => <VideoCard key={v.id} video={v} onWatch={onWatch} onVote={onVote} onSave={onSave} />)}
        </div>
      )}
    </div>
  );
}

function UploadPage({ onPublish }: { onPublish: (v: Video) => void }) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("");
  const [uploaded, setUploaded] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("video/")) return;
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setPreviewUrl(url);
    setFileName(file.name);
    const mb = file.size / 1024 / 1024;
    setFileSize(mb < 1024 ? mb.toFixed(1) + " МБ" : (mb / 1024).toFixed(2) + " ГБ");
    setStep(2);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handlePublish = () => {
    const newVideo: Video = {
      id: Date.now(),
      title,
      author: "Вы",
      avatar: title.charAt(0).toUpperCase(),
      views: "0",
      duration: "—",
      thumb: COLORS[Math.floor(Math.random() * COLORS.length)],
      likes: 0,
      dislikes: 0,
      userVote: null,
      description: desc || "Без описания",
      category,
      saved: false,
      videoUrl,
    };
    onPublish(newVideo);
    setUploaded(true);
  };

  if (uploaded) {
    return (
      <div className="text-center py-20 animate-scale-in">
        <div className="w-20 h-20 rounded-3xl bg-ios-green/10 flex items-center justify-center mx-auto mb-4">
          <Icon name="CheckCircle" size={42} className="text-ios-green" />
        </div>
        <h2 className="text-2xl font-black mb-2">Опубликовано!</h2>
        <p className="text-muted-foreground mb-6">Видео «{title}» добавлено в ленту</p>
        <button onClick={() => { setStep(1); setTitle(""); setDesc(""); setCategory(""); setUploaded(false); setFileName(""); setVideoUrl(""); setPreviewUrl(""); }} className="ios-btn">
          Загрузить ещё
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black">Загрузка видео</h2>
        <div className="flex gap-1.5">
          {[1, 2, 3].map(n => (
            <div key={n} className={`w-8 h-1.5 rounded-full transition-all ${n <= step ? "bg-ios-blue" : "bg-secondary"}`} />
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-4 animate-fade-in">
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`glass-card p-14 flex flex-col items-center justify-center border-2 border-dashed transition-all cursor-pointer ${
              dragging ? "border-ios-blue bg-ios-blue/5 scale-[1.01]" : "border-border hover:border-ios-blue/50"
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-ios-blue/10 flex items-center justify-center mb-4">
              <Icon name="Upload" size={30} className="text-ios-blue" />
            </div>
            <p className="font-semibold text-lg mb-1">Перетащи видео сюда</p>
            <p className="text-muted-foreground text-sm mb-5">или нажми, чтобы выбрать файл</p>
            <button
              onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
              className="ios-btn text-sm px-6 py-2.5"
            >
              Выбрать файл
            </button>
          </div>
          <p className="text-center text-xs text-muted-foreground">MP4, MOV, AVI, WebM — любой размер</p>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 animate-fade-in">
          {/* Preview player */}
          {previewUrl && (
            <div className="glass-card overflow-hidden">
              <video
                src={previewUrl}
                controls
                className="w-full rounded-2xl max-h-52 object-contain bg-black"
              />
            </div>
          )}

          <div className="glass-card p-4 flex items-center gap-3 bg-ios-green/5">
            <Icon name="FileVideo" size={24} className="text-ios-green" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{fileName}</p>
              <p className="text-xs text-muted-foreground">{fileSize}</p>
            </div>
            <Icon name="CheckCircle" size={20} className="text-ios-green flex-shrink-0" />
          </div>

          <div>
            <label className="text-sm font-semibold mb-1.5 block">Название *</label>
            <input className="ios-input" placeholder="Яркое название..." value={title} onChange={e => setTitle(e.target.value)} />
          </div>

          <div>
            <label className="text-sm font-semibold mb-1.5 block">Описание</label>
            <textarea className="ios-input resize-none" rows={3} placeholder="О чём видео..." value={desc} onChange={e => setDesc(e.target.value)} />
          </div>

          <div>
            <label className="text-sm font-semibold mb-1.5 block">Категория *</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.slice(1).map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${category === cat ? "bg-ios-blue text-white" : "bg-secondary text-muted-foreground"}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="ios-btn-secondary flex-1">Назад</button>
            <button onClick={() => title && category && setStep(3)} className={`ios-btn flex-1 ${!title || !category ? "opacity-50" : ""}`}>Далее</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 animate-fade-in">
          <div className="glass-card overflow-hidden">
            {previewUrl ? (
              <video src={previewUrl} className="w-full max-h-48 object-contain bg-black" muted />
            ) : (
              <div className="h-40 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-5xl opacity-60">🎬</span>
              </div>
            )}
            <div className="p-4">
              <p className="font-semibold">{title}</p>
              <p className="text-muted-foreground text-sm mt-0.5">{desc || "Без описания"}</p>
              <span className="inline-block mt-2 text-xs px-2.5 py-1 bg-ios-blue/10 text-ios-blue rounded-lg font-medium">{category}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="ios-btn-secondary flex-1">Назад</button>
            <button onClick={handlePublish} className="ios-btn flex-1 flex items-center justify-center gap-2">
              <Icon name="Upload" size={16} />
              Опубликовать
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfilePage({ user, isLoggedIn, onNavigate, onLogout }: {
  user: User | null;
  isLoggedIn: boolean;
  onNavigate: (p: Page) => void;
  onLogout: () => void;
}) {
  if (!isLoggedIn || !user) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-ios-blue to-ios-purple flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200 dark:shadow-blue-900">
          <Icon name="User" size={42} className="text-white" />
        </div>
        <h2 className="text-xl font-bold mb-2">Войди в аккаунт</h2>
        <p className="text-muted-foreground mb-6">Профиль и загрузка видео</p>
        <button onClick={() => onNavigate("auth")} className="ios-btn">Войти / Регистрация</button>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="glass-card p-6 text-center bg-gradient-to-br from-ios-blue/5 to-ios-purple/5">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-ios-blue to-ios-purple flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-200 dark:shadow-blue-900">
          <span className="text-3xl font-black text-white">{user.name.charAt(0)}</span>
        </div>
        <h2 className="text-xl font-black">{user.name}</h2>
        <p className="text-muted-foreground text-sm">{user.email}</p>
        <div className="flex justify-center gap-8 mt-4">
          {[
            { label: "Видео", value: user.videos },
            { label: "Подписчики", value: user.subscribers },
            { label: "Лайки", value: user.likes },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-xl font-black">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card overflow-hidden divide-y divide-border">
        {[
          { icon: "Video", label: "Мои видео", badge: user.videos },
          { icon: "Heart", label: "Понравившееся", badge: null },
          { icon: "Bell", label: "Уведомления", badge: 3 },
          { icon: "Settings", label: "Настройки", badge: null },
        ].map(item => (
          <button key={item.label} className="w-full flex items-center gap-3 p-4 hover:bg-secondary/50 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-ios-blue/10 flex items-center justify-center">
              <Icon name={item.icon as Parameters<typeof Icon>[0]["name"]} size={18} className="text-ios-blue" />
            </div>
            <span className="font-medium flex-1 text-left">{item.label}</span>
            {item.badge !== null && item.badge !== undefined && (
              <span className="bg-ios-red text-white text-xs px-2 py-0.5 rounded-full font-semibold">{item.badge}</span>
            )}
            <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
          </button>
        ))}
      </div>

      <button onClick={onLogout} className="w-full glass-card p-4 flex items-center gap-3 text-ios-red hover:bg-ios-red/5 transition-colors">
        <div className="w-9 h-9 rounded-xl bg-ios-red/10 flex items-center justify-center">
          <Icon name="LogOut" size={18} className="text-ios-red" />
        </div>
        <span className="font-semibold">Выйти из аккаунта</span>
      </button>
    </div>
  );
}

function AuthPage({ onLogin }: { onLogin: (user: User) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (mode === "register" && !name.trim()) e.name = "Введи имя";
    if (!email.includes("@")) e.email = "Некорректный email";
    if (password.length < 6) e.password = "Минимум 6 символов";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setLoading(true);
    setTimeout(() => {
      onLogin({
        name: mode === "register" ? name : email.split("@")[0],
        email,
        avatar: (mode === "register" ? name : email).charAt(0).toUpperCase(),
        subscribers: 0,
        videos: 0,
        likes: 0,
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center animate-fade-in">
      <div className="glass-card p-7 space-y-5">
        <div className="text-center mb-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-ios-blue to-ios-purple flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-200 dark:shadow-blue-900">
            <span className="text-3xl">▶</span>
          </div>
          <h1 className="text-2xl font-black">Vl Video</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {mode === "login" ? "Рады видеть снова!" : "Создай аккаунт бесплатно"}
          </p>
        </div>

        <div className="ios-segment">
          <button onClick={() => setMode("login")} className={`ios-segment-item ${mode === "login" ? "active" : ""}`}>Вход</button>
          <button onClick={() => setMode("register")} className={`ios-segment-item ${mode === "register" ? "active" : ""}`}>Регистрация</button>
        </div>

        <div className="space-y-3">
          {mode === "register" && (
            <div>
              <input className={`ios-input ${errors.name ? "border-ios-red" : ""}`} placeholder="Имя" value={name} onChange={e => setName(e.target.value)} />
              {errors.name && <p className="text-ios-red text-xs mt-1 ml-1">{errors.name}</p>}
            </div>
          )}
          <div>
            <input className={`ios-input ${errors.email ? "border-ios-red" : ""}`} placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            {errors.email && <p className="text-ios-red text-xs mt-1 ml-1">{errors.email}</p>}
          </div>
          <div className="relative">
            <input
              className={`ios-input pr-12 ${errors.password ? "border-ios-red" : ""}`}
              placeholder="Пароль"
              type={showPass ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
            />
            <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Icon name={showPass ? "EyeOff" : "Eye"} size={18} />
            </button>
            {errors.password && <p className="text-ios-red text-xs mt-1 ml-1">{errors.password}</p>}
          </div>
        </div>

        <button onClick={handleSubmit} disabled={loading} className="ios-btn w-full flex items-center justify-center gap-2">
          {loading
            ? <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            : <>{mode === "login" ? "Войти" : "Создать аккаунт"}</>
          }
        </button>

        {mode === "register" && (
          <p className="text-center text-xs text-muted-foreground">
            Регистрируясь, вы принимаете <span className="text-ios-blue">условия использования</span>
          </p>
        )}
      </div>
    </div>
  );
}

function VideoPlayer({ video }: { video: Video }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); }
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime);
    setProgress(v.duration ? (v.currentTime / v.duration) * 100 : 0);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    v.currentTime = pct * v.duration;
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().then(() => setFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onEnded = () => setPlaying(false);
    v.addEventListener("ended", onEnded);
    return () => v.removeEventListener("ended", onEnded);
  }, []);

  // If no real video URL — show decorative placeholder
  if (!video.videoUrl) {
    return (
      <div className={`relative h-52 rounded-3xl bg-gradient-to-br ${video.thumb} flex items-center justify-center shadow-xl overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative text-center">
          <span className="text-6xl block mb-3 opacity-70">{ICONS[video.id % ICONS.length]}</span>
          <p className="text-white/80 text-sm font-medium">Демо-видео</p>
          <p className="text-white/50 text-xs mt-1">Загрузите своё видео, чтобы смотреть</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="rounded-3xl overflow-hidden bg-black shadow-xl group">
      <div className="relative">
        <video
          ref={videoRef}
          src={video.videoUrl}
          className="w-full max-h-[60vh] object-contain"
          muted={muted}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
          onClick={togglePlay}
        />

        {/* Controls overlay */}
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {/* Big play button */}
          {!playing && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button onClick={togglePlay} className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                <Icon name="Play" size={28} className="text-white ml-1" />
              </button>
            </div>
          )}

          {/* Progress + controls bar */}
          <div className="px-4 pb-4 space-y-2">
            {/* Progress bar */}
            <div className="flex items-center gap-2">
              <span className="text-white/70 text-xs tabular-nums">{fmt(currentTime)}</span>
              <div className="flex-1 h-1.5 rounded-full bg-white/30 cursor-pointer" onClick={handleSeek}>
                <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-white/70 text-xs tabular-nums">{fmt(duration)}</span>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={togglePlay} className="p-1.5 rounded-lg bg-white/15 active:scale-90 transition-transform">
                  <Icon name={playing ? "Pause" : "Play"} size={18} className="text-white" />
                </button>
                <button onClick={() => { setMuted(m => !m); if (videoRef.current) videoRef.current.muted = !muted; }} className="p-1.5 rounded-lg bg-white/15 active:scale-90 transition-transform">
                  <Icon name={muted ? "VolumeX" : "Volume2"} size={18} className="text-white" />
                </button>
              </div>
              <button onClick={toggleFullscreen} className="p-1.5 rounded-lg bg-white/15 active:scale-90 transition-transform">
                <Icon name={fullscreen ? "Minimize2" : "Maximize2"} size={18} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Tap to show controls hint */}
        {playing && (
          <div className="absolute inset-0 cursor-pointer" onClick={togglePlay} />
        )}
      </div>
    </div>
  );
}

function WatchPage({ video, onBack, onVote, onSave, videos, onWatch }: {
  video: Video;
  onBack: () => void;
  onVote: (id: number, vote: "like" | "dislike") => void;
  onSave: (id: number) => void;
  videos: Video[];
  onWatch: (v: Video) => void;
}) {
  const related = videos.filter(v => v.id !== video.id).slice(0, 4);

  return (
    <div className="space-y-5 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-ios-blue font-semibold">
        <Icon name="ChevronLeft" size={20} />
        Назад
      </button>

      <VideoPlayer video={video} />

      <div className="space-y-3">
        <h1 className="text-xl font-black leading-snug">{video.title}</h1>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${COLORS[video.id % COLORS.length]} flex items-center justify-center text-white font-bold`}>
            {video.avatar.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-sm">{video.author}</p>
            <p className="text-muted-foreground text-xs">{video.views} просмотров · {video.duration}</p>
          </div>
          <button className="ml-auto ios-btn text-sm px-4 py-2">Подписаться</button>
        </div>

        <div className="flex items-center gap-3">
          <LikeBar video={video} onVote={onVote} />
          <button onClick={() => onSave(video.id)}
            className={`p-2.5 rounded-xl transition-all active:scale-90 flex-shrink-0 ${video.saved ? "bg-orange-100 dark:bg-orange-900/30 text-ios-orange" : "bg-secondary text-muted-foreground"}`}>
            <Icon name={video.saved ? "Bookmark" : "BookmarkPlus"} size={20} />
          </button>
          <button className="p-2.5 rounded-xl bg-secondary text-muted-foreground flex-shrink-0">
            <Icon name="Share2" size={20} />
          </button>
        </div>

        <div className="glass-card p-4">
          <p className="text-sm leading-relaxed text-muted-foreground">{video.description}</p>
          <span className="inline-block mt-2 text-xs px-2.5 py-1 bg-ios-blue/10 text-ios-blue rounded-lg font-medium">{video.category}</span>
        </div>
      </div>

      {related.length > 0 && (
        <div>
          <h3 className="font-bold mb-3">Похожие видео</h3>
          <div className="space-y-3">
            {related.map(v => (
              <button key={v.id} onClick={() => onWatch(v)} className="w-full text-left glass-card p-3 flex gap-3 hover-lift animate-fade-in">
                <div className={`w-24 h-16 bg-gradient-to-br ${v.thumb} rounded-xl flex-shrink-0 flex items-center justify-center`}>
                  <span className="text-2xl opacity-70">{ICONS[v.id % ICONS.length]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm line-clamp-2">{v.title}</p>
                  <p className="text-muted-foreground text-xs mt-1">{v.author} · {v.views}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Bottom Nav ─────────────────────────────────────────

const NAV_ITEMS: { id: Page; icon: string; label: string }[] = [
  { id: "home", icon: "Home", label: "Главная" },
  { id: "feed", icon: "PlaySquare", label: "Лента" },
  { id: "search", icon: "Search", label: "Поиск" },
  { id: "favorites", icon: "Bookmark", label: "Избранное" },
  { id: "profile", icon: "User", label: "Профиль" },
];

// ─── App ────────────────────────────────────────────────

export default function Index() {
  const [page, setPage] = useState<Page>("home");
  const [prevPage, setPrevPage] = useState<Page>("home");
  const [videos, setVideos] = useState<Video[]>(INITIAL_VIDEOS);
  const [watchVideo, setWatchVideo] = useState<Video | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  const navigate = (p: Page) => {
    setPrevPage(page);
    setPage(p);
    setWatchVideo(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleWatch = (v: Video) => {
    setPrevPage(page);
    setWatchVideo(v);
    setPage("watch");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleVote = (id: number, vote: "like" | "dislike") => {
    const update = (v: Video): Video => {
      if (v.id !== id) return v;
      const toggling = v.userVote === vote;
      return {
        ...v,
        likes: vote === "like"
          ? toggling ? v.likes - 1 : v.userVote === "dislike" ? v.likes + 1 : v.likes + 1
          : v.userVote === "like" ? v.likes - 1 : v.likes,
        dislikes: vote === "dislike"
          ? toggling ? v.dislikes - 1 : v.userVote === "like" ? v.dislikes + 1 : v.dislikes + 1
          : v.userVote === "dislike" ? v.dislikes - 1 : v.dislikes,
        userVote: toggling ? null : vote,
      };
    };
    setVideos(prev => prev.map(update));
    setWatchVideo(prev => prev ? update(prev) : prev);
  };

  const handleSave = (id: number) => {
    setVideos(prev => prev.map(v => v.id === id ? { ...v, saved: !v.saved } : v));
    setWatchVideo(prev => prev?.id === id ? { ...prev, saved: !prev.saved } : prev);
  };

  const handleLogin = (u: User) => {
    setIsLoggedIn(true);
    setUser(u);
    navigate("profile");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    navigate("home");
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="mesh-bg min-h-screen pb-28">
        {/* Top bar */}
        <div className="glass sticky top-0 z-40 px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate("home")} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-ios-blue to-ios-purple flex items-center justify-center">
              <span className="text-sm text-white font-black">▶</span>
            </div>
            <span className="font-black text-lg tracking-tight">Vl Video</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon name={darkMode ? "Sun" : "Moon"} size={18} />
            </button>
            {!isLoggedIn && (
              <button onClick={() => navigate("auth")} className="ios-btn text-sm px-4 py-2">Войти</button>
            )}
            {isLoggedIn && user && (
              <button onClick={() => navigate("profile")} className="w-9 h-9 rounded-xl bg-gradient-to-br from-ios-blue to-ios-purple flex items-center justify-center text-white font-bold text-sm">
                {user.name.charAt(0)}
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <main className="max-w-lg mx-auto px-4 pt-5">
          {page === "home" && <HomePage onNavigate={navigate} videos={videos} onWatch={handleWatch} onVote={handleVote} onSave={handleSave} />}
          {page === "feed" && <FeedPage videos={videos} onWatch={handleWatch} onVote={handleVote} onSave={handleSave} />}
          {page === "search" && <SearchPage videos={videos} onWatch={handleWatch} />}
          {page === "favorites" && <FavoritesPage videos={videos} onWatch={handleWatch} onVote={handleVote} onSave={handleSave} />}
          {page === "upload" && <UploadPage onPublish={(v) => { setVideos(prev => [v, ...prev]); setWatchVideo(v); setPrevPage("feed"); setPage("watch"); window.scrollTo({ top: 0, behavior: "smooth" }); }} />}
          {page === "profile" && <ProfilePage user={user} isLoggedIn={isLoggedIn} onNavigate={navigate} onLogout={handleLogout} />}
          {page === "auth" && <AuthPage onLogin={handleLogin} />}
          {page === "watch" && watchVideo && (
            <WatchPage video={watchVideo} onBack={() => navigate(prevPage)} onVote={handleVote} onSave={handleSave} videos={videos} onWatch={handleWatch} />
          )}
        </main>

        {/* Bottom Nav */}
        {page !== "auth" && (
          <div className="fixed bottom-0 left-0 right-0 z-40 glass-nav px-2 pt-1 pb-4">
            <div className="max-w-lg mx-auto flex">
              {NAV_ITEMS.map(item => {
                const isActive = page === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.id)}
                    className="flex-1 flex flex-col items-center gap-0.5 py-2 transition-all active:scale-90"
                  >
                    <div className={`p-1.5 rounded-xl transition-all ${isActive ? "bg-ios-blue/15" : ""}`}>
                      <Icon name={item.icon as Parameters<typeof Icon>[0]["name"]} size={22} className={isActive ? "text-ios-blue" : "text-muted-foreground"} />
                    </div>
                    <span className={`text-[10px] font-semibold ${isActive ? "text-ios-blue" : "text-muted-foreground"}`}>{item.label}</span>
                  </button>
                );
              })}
              <button
                onClick={() => navigate("upload")}
                className="flex-1 flex flex-col items-center gap-0.5 py-2 transition-all active:scale-90"
              >
                <div className="p-1.5 rounded-xl bg-ios-blue shadow-md shadow-blue-200 dark:shadow-blue-900">
                  <Icon name="Plus" size={22} className="text-white" />
                </div>
                <span className="text-[10px] font-semibold text-ios-blue">Загрузить</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}