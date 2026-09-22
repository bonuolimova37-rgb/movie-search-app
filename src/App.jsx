

import { useState, useEffect } from "react";
import { Search, X, Loader2, ExternalLink, Star, Clapperboard, Sparkles } from "lucide-react";
import "./App.css";

const CHIPS = ["batman", "dune", "oppenheimer", "inception", "interstellar", "matrix"];

export default function MovieSearchApp() {
  const [apiKey, setApiKey] = useState("apikeyingizni almawtiring");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState({ text: "", kind: "" });
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [hasSearchedOnce, setHasSearchedOnce] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Archivo:wght@400;500;600;700;900&family=Space+Mono:wght@400;700&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  async function doSearch(e, overrideQuery) {
    if (e) e.preventDefault();
    const key = apiKey.trim();
    const q = (overrideQuery ?? query).trim();

    if (!key) {
      setStatus({ text: "API key kerak — pastdagi havoladan bepul key oling.", kind: "error" });
      return;
    }
    if (!q) {
      setStatus({ text: "Qidirish uchun film nomini yozing.", kind: "error" });
      return;
    }

    setHasSearchedOnce(true);
    setLoading(true);
    setStatus({ text: "Qidirilmoqda...", kind: "loading" });

    try {
      const url = `https://www.omdbapi.com/?apikey=${encodeURIComponent(key)}&s=${encodeURIComponent(q)}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.Response === "False") {
        setResults([]);
        setStatus({ text: data.Error || "Natija topilmadi.", kind: "error" });
      } else {
        setResults(data.Search || []);
        setStatus({ text: `${(data.Search || []).length} ta natija topildi.`, kind: "info" });
      }
    } catch (err) {
      setStatus({ text: "Xatolik yuz berdi: tarmoqqa ulanib bo'lmadi.", kind: "error" });
    } finally {
      setLoading(false);
    }
  }

  function removeMovie(imdbID) {
    setResults((prev) => prev.filter((m) => m.imdbID !== imdbID));
  }

  async function openDetails(imdbID) {
    setDetail(null);
    setDetailError("");
    setDetailLoading(true);
    try {
      const key = apiKey.trim();
      const url = `https://www.omdbapi.com/?apikey=${encodeURIComponent(key)}&i=${encodeURIComponent(imdbID)}&plot=full`;
      const res = await fetch(url);
      const d = await res.json();
      if (d.Response === "False") {
        setDetailError(d.Error || "Ma'lumot topilmadi.");
        setDetail(null);
      } else {
        setDetail(d);
      }
    } catch (err) {
      setDetailError("Xatolik: ma'lumotni yuklab bo'lmadi.");
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }

  function closeModal() {
    setDetail(null);
    setDetailError("");
    setDetailLoading(false);
  }

  function useChip(term) {
    setQuery(term);
    doSearch(null, term);
  }

  return (
    <div className="msa-page">
      <div className="msa-filmstrip" />

      {/* Header */}
      <header className="msa-header">
        <div className="msa-header-glow" />
        <div className="msa-eyebrow">
          <Sparkles size={12} /> now searching · omdb archive
        </div>
        <h1 className="msa-title">
          MOVIE <span>SEARCH</span>
        </h1>
        <p className="msa-tagline">
          Kino nomini yozing — poster, yil va tavsif bilan natijalarni oling. Keraksiz kartani
          o'chiring, kerakli filmni bosib batafsil ma'lumotga o'ting.
        </p>
      </header>

      {/* Search booth */}
      <div className="msa-booth">
        <form onSubmit={doSearch} className="msa-booth-card">
          <div className="msa-key-row">
            <input
              className="msa-key-input msa-input"
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="OMDb API key ni shu yerga qo'ying (masalan: 1a2b3c4d)"
            />
            <a
              href="https://www.omdbapi.com/apikey.aspx"
              target="_blank"
              rel="noopener noreferrer"
              className="msa-key-link"
            >
              bepul key olish <ExternalLink size={12} />
            </a>
          </div>

          <div className="msa-search-row">
            <input
              className="msa-search-input msa-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Film nomi... (masalan: batman)"
            />
            <button type="submit" disabled={loading} className="msa-btn-primary">
              {loading ? <Loader2 size={16} className="msa-spin" /> : <Search size={16} />}
              Qidirish
            </button>
          </div>
        </form>

        <div className="msa-chips">
          <span className="msa-chips-label">TEZKOR:</span>
          {CHIPS.map((c) => (
            <button key={c} onClick={() => useChip(c)} disabled={loading} className="msa-chip">
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className={`msa-status ${status.kind}`}>{status.text}</div>

      {/* Grid / Empty state */}
      <main className="msa-main">
        {loading ? (
          <div className="msa-grid">
            {Array.from({ length: 10 }).map((_, i) => (
              <div className="msa-card" key={i} style={{ animation: "none" }}>
                <div className="msa-skeleton" style={{ aspectRatio: "2 / 3" }} />
                <div className="msa-card-body">
                  <div className="msa-skeleton msa-skeleton-line" style={{ width: "80%" }} />
                  <div className="msa-skeleton msa-skeleton-line" style={{ width: "50%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="msa-empty">
            <Clapperboard size={44} className="msa-empty-icon" />
            <span className="msa-empty-title">{hasSearchedOnce ? "NATIJA YO'Q" : "EKRAN BO'SH"}</span>
            {hasSearchedOnce
              ? "Boshqa nom bilan qayta urinib ko'ring."
              : "Yuqoridagi maydonga film nomini yozing yoki tezkor teglardan birini tanlang."}
          </div>
        ) : (
          <div className="msa-grid">
            {results.map((m, idx) => {
              const posterOk = m.Poster && m.Poster !== "N/A";
              return (
                <div className="msa-card" key={m.imdbID} style={{ animationDelay: `${Math.min(idx * 0.04, 0.4)}s` }}>
                  <div className="msa-poster-wrap">
                    {posterOk && <img src={m.Poster} alt={m.Title} loading="lazy" />}
                    <div className="msa-stub">
                      <span className="msa-year-tag">{m.Year || "—"}</span>
                      <button
                        className="msa-del-btn"
                        title="Ro'yxatdan o'chirish"
                        onClick={() => removeMovie(m.imdbID)}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="msa-card-body">
                    <div className="msa-card-title">{m.Title}</div>
                    <div className="msa-card-type">{m.Type}</div>
                    <button className="msa-detail-btn" onClick={() => openDetails(m.imdbID)}>
                      BATAFSIL →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="msa-footer">MOVIE SEARCH APP · DATA FROM OMDBAPI.COM</footer>

      {/* Modal */}
      {(detail || detailLoading || detailError) && (
        <div
          className="msa-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="msa-modal">
            {detailLoading ? (
              <div className="msa-modal-state center">
                <button className="msa-modal-close" onClick={closeModal}>
                  <X size={16} />
                </button>
                <Loader2 className="msa-spin" style={{ color: "var(--marquee)" }} />
                <div style={{ marginTop: "0.6rem", fontSize: "0.9rem", color: "var(--cream-dim)" }}>
                  Yuklanmoqda...
                </div>
              </div>
            ) : detailError ? (
              <div className="msa-modal-state">
                <button className="msa-modal-close" onClick={closeModal}>
                  <X size={16} />
                </button>
                <p className="msa-error-text">{detailError}</p>
              </div>
            ) : detail ? (
              <>
                {detail.Poster && detail.Poster !== "N/A" && (
                  <img className="msa-modal-poster" src={detail.Poster} alt={detail.Title} />
                )}
                <div className="msa-modal-body">
                  <button className="msa-modal-close" onClick={closeModal}>
                    <X size={16} />
                  </button>
                  <h2 className="msa-modal-title">{detail.Title}</h2>
                  <div className="msa-modal-meta">
                    {[detail.Year, detail.Rated, detail.Runtime, detail.Genre].filter(Boolean).join(" · ")}
                  </div>
                  <div className="msa-modal-plot">{detail.Plot}</div>
                  <div className="msa-rating-row">
                    {(detail.Ratings || []).map((r, i) => (
                      <div className="msa-rating-chip" key={i}>
                        <Star size={12} style={{ color: "var(--marquee)" }} />
                        {r.Source}: <b>{r.Value}</b>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}