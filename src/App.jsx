import { useState, useEffect, useCallback } from "react";

const TOTAL_NUMBERS = 30;
const PICK_COUNT = 5;
const ENTRY_COST = 5;
const PHONE = "+15165547579";
const ADMIN_PIN = "1234"; // Change this to your desired PIN

const Confetti = ({ active }) => {
  if (!active) return null;
  const colors = ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DFE6E9", "#fd79a8"];
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 999 }}>
      {Array.from({ length: 60 }).map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 2;
        const dur = 2 + Math.random() * 2;
        const size = 6 + Math.random() * 10;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const rot = Math.random() * 360;
        return (
          <div key={i} style={{
            position: "absolute", left: `${left}%`, top: -20, width: size, height: size * 0.6,
            backgroundColor: color, borderRadius: 2, transform: `rotate(${rot}deg)`,
            animation: `confettiFall ${dur}s ease-in ${delay}s forwards`,
          }} />
        );
      })}
    </div>
  );
};

const defaultState = {
  players: [],
  pot: 0,
  weekNumber: 1,
  drawnNumbers: null,
  winners: [],
  phase: "entry",
  history: [],
  paidStatus: {},
};

// ─── Storage helpers using localStorage ───
const saveState = (state) => {
  try {
    localStorage.setItem("lottery-state", JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save:", e);
  }
};

const loadState = () => {
  try {
    const saved = localStorage.getItem("lottery-state");
    if (saved) {
      return { ...defaultState, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error("Failed to load:", e);
  }
  return defaultState;
};

const PaymentButtons = ({ amount, note }) => {
  const venmoUrl = `https://venmo.com/?txn=pay&amount=${amount}&note=${encodeURIComponent(note)}`;
  const smsUrl = `sms:${PHONE}&body=${encodeURIComponent(`Apple Cash: $${amount} for ${note}`)}`;

  return (
    <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
      <a href={venmoUrl} target="_blank" rel="noopener noreferrer" style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        padding: "14px 12px", borderRadius: 12, border: "none", cursor: "pointer",
        background: "linear-gradient(135deg, #008CFF, #0074E4)", color: "#fff",
        fontSize: 14, fontWeight: 700, textDecoration: "none", letterSpacing: 0.3,
        boxShadow: "0 4px 15px rgba(0,140,255,0.25)",
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
          <path d="M19.5 2.3c.7 1.2 1 2.4 1 3.9 0 4.8-4.1 11-7.4 15.4H6.4L4 3.8l5.2-.5 1.4 11.1c1.6-2.6 3.5-6.7 3.5-9.5 0-1.4-.2-2.3-.6-3.1l6.1.5z"/>
        </svg>
        Venmo
      </a>
      <a href={smsUrl} style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        padding: "14px 12px", borderRadius: 12, border: "none", cursor: "pointer",
        background: "linear-gradient(135deg, #1a1a1a, #333)", color: "#fff",
        fontSize: 14, fontWeight: 700, textDecoration: "none", letterSpacing: 0.3,
        boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/>
          <path d="M12 6v6l4 2"/>
        </svg>
        Apple Cash
      </a>
    </div>
  );
};

// ─── Admin Login Gate ───
const AdminLogin = ({ onSuccess, onBack }) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleDigit = (d) => {
    if (pin.length >= 6) return;
    const next = pin + d;
    setPin(next);
    setError(false);
  };

  const handleDelete = () => {
    setPin((p) => p.slice(0, -1));
    setError(false);
  };

  const handleSubmit = () => {
    if (pin === ADMIN_PIN) {
      onSuccess();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => { setShake(false); setPin(""); }, 600);
    }
  };

  useEffect(() => {
    if (pin.length > 0 && pin.length === ADMIN_PIN.length) {
      setTimeout(handleSubmit, 200);
    }
  }, [pin]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0a0e1a 0%, #1a1040 40%, #0d2137 100%)",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: "#e8e6f0", display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "20px",
    }}>
      <style>{`
        @keyframes shakeAnim { 0%,100% { transform: translateX(0); } 20%,60% { transform: translateX(-10px); } 40%,80% { transform: translateX(10px); } }
      `}</style>

      <button onClick={onBack} style={{
        position: "absolute", top: 20, left: 20,
        background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 10, padding: "10px 14px", color: "#8b86ad", cursor: "pointer", fontSize: 14, fontWeight: 600,
      }}>← Back</button>

      <div style={{ fontSize: 14, color: "#8b86ad", textTransform: "uppercase", letterSpacing: 3, marginBottom: 8 }}>
        Admin Access
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 32 }}>
        Enter PIN
      </div>

      <div style={{
        display: "flex", gap: 14, marginBottom: 12,
        animation: shake ? "shakeAnim 0.5s ease" : "none",
      }}>
        {Array.from({ length: ADMIN_PIN.length }).map((_, i) => (
          <div key={i} style={{
            width: 16, height: 16, borderRadius: "50%",
            border: `2px solid ${error ? "#ff6b6b" : i < pin.length ? "#FFD700" : "rgba(255,255,255,0.2)"}`,
            background: i < pin.length ? (error ? "#ff6b6b" : "#FFD700") : "transparent",
            transition: "all 0.15s ease",
          }} />
        ))}
      </div>

      {error && (
        <div style={{ fontSize: 13, color: "#ff6b6b", marginBottom: 16, fontWeight: 600 }}>
          Incorrect PIN
        </div>
      )}

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12,
        width: 260, marginTop: 16,
      }}>
        {[1,2,3,4,5,6,7,8,9,null,0,"del"].map((d, i) => {
          if (d === null) return <div key={i} />;
          if (d === "del") {
            return (
              <button key={i} onClick={handleDelete} style={{
                height: 60, borderRadius: 16, border: "none", cursor: "pointer",
                background: "rgba(255,255,255,0.04)", color: "#8b86ad",
                fontSize: 18, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
                  <line x1="18" y1="9" x2="12" y2="15"/>
                  <line x1="12" y1="9" x2="18" y2="15"/>
                </svg>
              </button>
            );
          }
          return (
            <button key={i} onClick={() => handleDigit(String(d))} style={{
              height: 60, borderRadius: 16, border: "none", cursor: "pointer",
              background: "rgba(255,255,255,0.06)", color: "#fff",
              fontSize: 24, fontWeight: 700, transition: "background 0.15s",
            }}>{d}</button>
          );
        })}
      </div>
    </div>
  );
};

// ─── Admin Page ───
const AdminPage = ({ state, onBack, onTogglePaid, onRemovePlayer }) => {
  const { history, weekNumber: currentWeek, pot, players, paidStatus } = state;
  const allEntries = history.reduce((sum, h) => sum + h.players.length, 0) + players.length;
  const totalCollected = allEntries * ENTRY_COST;
  const totalPaidOut = history.reduce((sum, h) => h.winners.length > 0 ? sum + h.pot : sum, 0);

  const freq = {};
  history.forEach(h => h.drawn.forEach(n => { freq[n] = (freq[n] || 0) + 1; }));
  const maxFreq = Math.max(...Object.values(freq), 1);

  const currentPaidCount = players.filter((_, i) => paidStatus[`week${currentWeek}-${i}`]).length;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0a0e1a 0%, #1a1040 40%, #0d2137 100%)",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: "#e8e6f0", padding: "20px 16px 60px",
    }}>
      <style>{`
        @keyframes slideIn { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
        <button onClick={onBack} style={{
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 10, padding: "10px 14px", color: "#8b86ad", cursor: "pointer", fontSize: 14, fontWeight: 600,
        }}>← Back</button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>Admin Dashboard</div>
          <div style={{ fontSize: 11, color: "#8b86ad", letterSpacing: 2, textTransform: "uppercase" }}>Manage & Track</div>
        </div>
        <div style={{ width: 70 }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
        {[
          { label: "Total Weeks", value: currentWeek, color: "#a5b4fc" },
          { label: "Current Pot", value: `$${pot}`, color: "#FFD700" },
          { label: "Total Collected", value: `$${totalCollected}`, color: "#4ade80" },
          { label: "Total Paid Out", value: `$${totalPaidOut}`, color: "#fb923c" },
        ].map((s, i) => (
          <div key={i} style={{
            background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: "14px",
            border: "1px solid rgba(255,255,255,0.06)", animation: `slideIn 0.3s ease ${i * 0.05}s both`,
          }}>
            <div style={{ fontSize: 10, color: "#6b6890", textTransform: "uppercase", letterSpacing: 2 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color, marginTop: 4 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {players.length > 0 && state.phase === "entry" && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: "#8b86ad", textTransform: "uppercase", letterSpacing: 2 }}>
              Week #{currentWeek} — Payments
            </div>
            <div style={{
              fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 20,
              background: currentPaidCount === players.length ? "rgba(74,222,128,0.15)" : "rgba(251,146,60,0.15)",
              color: currentPaidCount === players.length ? "#4ade80" : "#fb923c",
              border: `1px solid ${currentPaidCount === players.length ? "rgba(74,222,128,0.3)" : "rgba(251,146,60,0.3)"}`,
            }}>
              {currentPaidCount}/{players.length} paid
            </div>
          </div>
          {players.map((p, i) => {
            const key = `week${currentWeek}-${i}`;
            const isPaid = !!paidStatus[key];
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 14px", background: isPaid ? "rgba(74,222,128,0.06)" : "rgba(255,255,255,0.03)",
                borderRadius: 12, marginBottom: 6,
                border: `1px solid ${isPaid ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.06)"}`,
                transition: "all 0.2s",
              }}>
                <button onClick={() => onTogglePaid(key)} style={{
                  width: 28, height: 28, borderRadius: 8, border: `2px solid ${isPaid ? "#4ade80" : "rgba(255,255,255,0.2)"}`,
                  background: isPaid ? "rgba(74,222,128,0.2)" : "transparent",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s", flexShrink: 0,
                }}>
                  {isPaid && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: isPaid ? "#e8e6f0" : "#999" }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: isPaid ? "#4ade80" : "#fb923c", fontWeight: 600, marginTop: 1 }}>
                    {isPaid ? "✓ Paid $5" : "Awaiting $5"}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  {p.numbers.map(n => (
                    <span key={n} style={{
                      width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 700, background: "rgba(99,102,241,0.15)", color: "#a5b4fc",
                    }}>{n}</span>
                  ))}
                </div>
                <button onClick={() => onRemovePlayer(i)} style={{
                  background: "none", border: "none", cursor: "pointer", color: "#555", fontSize: 16, padding: "4px", marginLeft: 4,
                }}>✕</button>
              </div>
            );
          })}
        </div>
      )}

      {history.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, color: "#8b86ad", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>
            Number Frequency
          </div>
          <div style={{
            display: "flex", gap: 3, alignItems: "flex-end", height: 80,
            background: "rgba(255,255,255,0.02)", borderRadius: 12, padding: "12px 8px 8px",
            border: "1px solid rgba(255,255,255,0.05)",
          }}>
            {Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1).map(n => {
              const count = freq[n] || 0;
              const height = count > 0 ? (count / maxFreq) * 60 + 4 : 4;
              return (
                <div key={n} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <div style={{
                    width: "100%", height, borderRadius: 3,
                    background: count > 0 ? `rgba(255,215,0,${0.3 + (count / maxFreq) * 0.7})` : "rgba(255,255,255,0.05)",
                  }} />
                  <div style={{ fontSize: 7, color: "#555" }}>{n}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ fontSize: 13, color: "#8b86ad", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>
        All Draws ({history.length})
      </div>
      {history.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "40px 20px", background: "rgba(255,255,255,0.02)",
          borderRadius: 14, border: "1px solid rgba(255,255,255,0.05)", color: "#555",
        }}>No draws yet.</div>
      ) : (
        [...history].reverse().map((h, idx) => (
          <div key={h.week} style={{
            background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: "14px",
            marginBottom: 10, border: "1px solid rgba(255,255,255,0.06)",
            animation: `slideIn 0.3s ease ${idx * 0.04}s both`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 16, fontWeight: 800 }}>Week #{h.week}</div>
              <div style={{
                fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20,
                background: h.winners.length > 0 ? "rgba(74,222,128,0.15)" : "rgba(251,146,60,0.15)",
                color: h.winners.length > 0 ? "#4ade80" : "#fb923c",
                border: `1px solid ${h.winners.length > 0 ? "rgba(74,222,128,0.3)" : "rgba(251,146,60,0.3)"}`,
              }}>
                {h.winners.length > 0 ? `WON: ${h.winners.map(w => w.name).join(", ")}` : "ROLLED OVER"}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              <span style={{ fontSize: 11, color: "#6b6890", alignSelf: "center", marginRight: 4 }}>Drawn:</span>
              {h.drawn.map(n => (
                <span key={n} style={{
                  width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, background: "rgba(255,215,0,0.15)", color: "#d4a853",
                  border: "1px solid rgba(255,215,0,0.25)",
                }}>{n}</span>
              ))}
              <span style={{ marginLeft: "auto", fontSize: 13, fontWeight: 700, color: "#FFD700", alignSelf: "center" }}>
                Pot: ${h.pot}
              </span>
            </div>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 8 }}>
              {h.players.map((p, pi) => {
                const matches = p.numbers.filter(n => h.drawn.includes(n)).length;
                const isWinner = h.winners.some(w => w.name === p.name && JSON.stringify(w.numbers) === JSON.stringify(p.numbers));
                const wasPaid = !!paidStatus[`week${h.week}-${pi}`];
                return (
                  <div key={pi} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: wasPaid ? "#4ade80" : "#fb923c", flexShrink: 0 }} />
                      <span style={{ fontSize: 13, fontWeight: isWinner ? 700 : 500, color: isWinner ? "#4ade80" : "#b0adc5" }}>
                        {p.name} {isWinner && "🏆"}
                      </span>
                      <span style={{ fontSize: 10, color: "#555" }}>({matches}/{PICK_COUNT})</span>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      {p.numbers.map(n => {
                        const isMatch = h.drawn.includes(n);
                        return (
                          <span key={n} style={{
                            width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 9, fontWeight: 700,
                            background: isMatch ? "rgba(255,215,0,0.2)" : "rgba(255,255,255,0.04)",
                            color: isMatch ? "#FFD700" : "#444",
                          }}>{n}</span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

// ─── Main App ───
export default function App() {
  const [state, setState] = useState(() => loadState());
  const [currentName, setCurrentName] = useState("");
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [page, setPage] = useState("main");

  // Save to localStorage whenever state changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  const toggleNumber = (n) => {
    setSelectedNumbers((prev) => {
      if (prev.includes(n)) return prev.filter((x) => x !== n);
      if (prev.length >= PICK_COUNT) return prev;
      return [...prev, n];
    });
  };

  const addEntry = () => {
    if (!currentName.trim() || selectedNumbers.length !== PICK_COUNT) return;
    setState((s) => ({
      ...s,
      players: [...s.players, { name: currentName.trim(), numbers: [...selectedNumbers].sort((a, b) => a - b) }],
      pot: s.pot + ENTRY_COST,
    }));
    setCurrentName("");
    setSelectedNumbers([]);
  };

  const removePlayer = (index) => {
    setState((s) => ({
      ...s,
      players: s.players.filter((_, i) => i !== index),
      pot: Math.max(0, s.pot - ENTRY_COST),
    }));
  };

  const togglePaid = (key) => {
    setState((s) => ({
      ...s, paidStatus: { ...s.paidStatus, [key]: !s.paidStatus[key] },
    }));
  };

  const drawNumbers = useCallback(() => {
    if (state.players.length === 0) return;
    setState((s) => ({ ...s, phase: "drawing" }));
    setRevealedCount(0);

    const drawn = [];
    while (drawn.length < PICK_COUNT) {
      const n = Math.floor(Math.random() * TOTAL_NUMBERS) + 1;
      if (!drawn.includes(n)) drawn.push(n);
    }
    drawn.sort((a, b) => a - b);

    for (let i = 1; i <= PICK_COUNT; i++) {
      setTimeout(() => setRevealedCount(i), i * 800);
    }

    setTimeout(() => {
      const winners = state.players.filter(
        (p) => p.numbers.length === drawn.length && p.numbers.every((n, idx) => n === drawn[idx])
      );
      if (winners.length > 0) setShowConfetti(true);
      setState((s) => ({
        ...s, drawnNumbers: drawn, winners, phase: "results",
        history: [...s.history, { week: s.weekNumber, drawn, players: s.players, winners, pot: s.pot }],
      }));
    }, PICK_COUNT * 800 + 600);

    setState((s) => ({ ...s, drawnNumbers: drawn }));
  }, [state.players]);

  const nextWeek = () => {
    setShowConfetti(false);
    setState((s) => ({
      ...s, players: [], pot: s.winners.length > 0 ? 0 : s.pot,
      weekNumber: s.weekNumber + 1, drawnNumbers: null, winners: [], phase: "entry",
    }));
  };

  const resetAll = () => {
    if (!confirm("Are you sure? This will erase ALL data including history.")) return;
    setShowConfetti(false);
    setState(defaultState);
    setCurrentName("");
    setSelectedNumbers([]);
  };

  const matchCount = (playerNums, drawnNums) => {
    if (!drawnNums) return 0;
    return playerNums.filter((n) => drawnNums.includes(n)).length;
  };

  if (page === "adminLogin") {
    return <AdminLogin onSuccess={() => setPage("admin")} onBack={() => setPage("main")} />;
  }

  if (page === "admin") {
    return <AdminPage state={state} onBack={() => setPage("main")} onTogglePaid={togglePaid} onRemovePlayer={removePlayer} />;
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0a0e1a 0%, #1a1040 40%, #0d2137 100%)",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: "#e8e6f0", padding: "20px 16px 60px", position: "relative", overflow: "hidden",
    }}>
      <style>{`
        @keyframes confettiFall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
        @keyframes ballPop { 0% { transform: scale(0) rotate(-180deg); opacity: 0; } 60% { transform: scale(1.2) rotate(10deg); opacity: 1; } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
        @keyframes pulse { 0%, 100% { box-shadow: 0 0 20px rgba(255,215,0,0.3); } 50% { box-shadow: 0 0 40px rgba(255,215,0,0.6); } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
        input::placeholder { color: #6b6890; }
      `}</style>

      <Confetti active={showConfetti} />

      <div style={{ position: "absolute", top: -100, right: -100, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -50, left: -80, width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(236,72,153,0.1), transparent 70%)", pointerEvents: "none" }} />

      <div style={{ textAlign: "center", marginBottom: 6 }}>
        <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: -1, background: "linear-gradient(135deg, #FFD700, #FFA500, #FF6B6B)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.1 }}>
          LUCKY DRAW
        </div>
        <div style={{ fontSize: 13, color: "#8b86ad", marginTop: 4, letterSpacing: 3, textTransform: "uppercase" }}>
          Weekly Friendly Lottery
        </div>
      </div>

      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <button onClick={() => setPage("adminLogin")} style={{
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 8, padding: "6px 16px", color: "#6b6890", cursor: "pointer",
          fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase",
        }}>🔒 Admin</button>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <div style={{
          flex: 1, background: "rgba(255,255,255,0.05)", borderRadius: 16, padding: "16px 14px",
          border: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{ fontSize: 11, color: "#8b86ad", textTransform: "uppercase", letterSpacing: 2 }}>Week</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#fff", marginTop: 2 }}>#{state.weekNumber}</div>
        </div>
        <div style={{
          flex: 1, background: "linear-gradient(135deg, rgba(255,215,0,0.12), rgba(255,107,107,0.08))",
          borderRadius: 16, padding: "16px 14px",
          border: "1px solid rgba(255,215,0,0.2)", animation: state.pot > 0 ? "pulse 3s infinite" : "none",
        }}>
          <div style={{ fontSize: 11, color: "#d4a853", textTransform: "uppercase", letterSpacing: 2 }}>Pot</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#FFD700", marginTop: 2 }}>${state.pot}</div>
          {state.pot > state.players.length * ENTRY_COST && (
            <div style={{ fontSize: 10, color: "#e8a44a", marginTop: 2 }}>Includes rollover!</div>
          )}
        </div>
      </div>

      {state.phase === "entry" && (
        <div style={{
          background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: "14px",
          border: "1px solid rgba(255,255,255,0.06)", marginBottom: 20,
        }}>
          <div style={{ fontSize: 11, color: "#8b86ad", textTransform: "uppercase", letterSpacing: 2, textAlign: "center" }}>
            Pay ${ENTRY_COST} Entry Fee
          </div>
          <PaymentButtons amount={ENTRY_COST} note={`Lucky Draw Week ${state.weekNumber}`} />
        </div>
      )}

      {state.phase === "entry" && (
        <>
          <div style={{ marginBottom: 16 }}>
            <input
              type="text" placeholder="Enter player name..."
              value={currentName} onChange={(e) => setCurrentName(e.target.value)}
              style={{
                width: "100%", boxSizing: "border-box", padding: "14px 16px", borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)",
                color: "#fff", fontSize: 16, outline: "none",
              }}
              onFocus={(e) => e.target.style.borderColor = "rgba(255,215,0,0.4)"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            />
          </div>

          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: "#8b86ad", marginBottom: 10, textAlign: "center" }}>
              Pick {PICK_COUNT} numbers (1–{TOTAL_NUMBERS}) · <span style={{ color: "#FFD700" }}>{selectedNumbers.length}/{PICK_COUNT} selected</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
              {Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1).map((n) => {
                const isSelected = selectedNumbers.includes(n);
                return (
                  <button key={n} onClick={() => toggleNumber(n)} style={{
                    aspectRatio: "1", borderRadius: "50%", border: "none", cursor: "pointer",
                    fontSize: 15, fontWeight: 700,
                    background: isSelected ? "linear-gradient(135deg, #FFD700, #FFA500)" : "rgba(255,255,255,0.06)",
                    color: isSelected ? "#1a1040" : "#8b86ad",
                    transition: "all 0.2s",
                    transform: isSelected ? "scale(1.1)" : "scale(1)",
                    boxShadow: isSelected ? "0 4px 15px rgba(255,215,0,0.3)" : "none",
                  }}>{n}</button>
                );
              })}
            </div>
          </div>

          <button onClick={addEntry} disabled={!currentName.trim() || selectedNumbers.length !== PICK_COUNT} style={{
            width: "100%", padding: "16px", borderRadius: 14, border: "none", cursor: "pointer",
            fontSize: 16, fontWeight: 700, marginTop: 16, marginBottom: 20, letterSpacing: 0.5,
            background: currentName.trim() && selectedNumbers.length === PICK_COUNT
              ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "rgba(255,255,255,0.06)",
            color: currentName.trim() && selectedNumbers.length === PICK_COUNT ? "#fff" : "#555",
            transition: "all 0.3s",
          }}>Submit Entry · ${ENTRY_COST}</button>

          {state.players.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: "#8b86ad", textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>
                Entries ({state.players.length})
              </div>
              {state.players.map((p, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 14px", background: "rgba(255,255,255,0.04)", borderRadius: 12,
                  marginBottom: 6, border: "1px solid rgba(255,255,255,0.05)",
                }}>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{p.name}</span>
                  <div style={{ display: "flex", gap: 6 }}>
                    {p.numbers.map((n) => (
                      <span key={n} style={{
                        width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 700, background: "rgba(99,102,241,0.2)", color: "#a5b4fc",
                      }}>{n}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {state.players.length > 0 && (
            <button onClick={drawNumbers} style={{
              width: "100%", padding: "18px", borderRadius: 16, border: "2px solid #FFD700",
              cursor: "pointer", fontSize: 18, fontWeight: 800, letterSpacing: 1,
              background: "linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,165,0,0.1))",
              color: "#FFD700", animation: "float 3s ease-in-out infinite", textTransform: "uppercase",
            }}>🎱 Draw This Week's Numbers</button>
          )}
        </>
      )}

      {state.phase === "drawing" && state.drawnNumbers && (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div style={{ fontSize: 14, color: "#8b86ad", textTransform: "uppercase", letterSpacing: 3, marginBottom: 30 }}>
            Drawing numbers...
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 14 }}>
            {state.drawnNumbers.map((n, i) => (
              <div key={i} style={{
                width: 52, height: 52, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, fontWeight: 800,
                background: i < revealedCount ? "linear-gradient(135deg, #FFD700, #FFA500)" : "rgba(255,255,255,0.06)",
                color: i < revealedCount ? "#1a1040" : "transparent",
                animation: i < revealedCount ? "ballPop 0.5s ease-out forwards" : "none",
                boxShadow: i < revealedCount ? "0 4px 20px rgba(255,215,0,0.4)" : "none",
              }}>{i < revealedCount ? n : "?"}</div>
            ))}
          </div>
        </div>
      )}

      {state.phase === "results" && (
        <div>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 12, color: "#8b86ad", textTransform: "uppercase", letterSpacing: 3, marginBottom: 14 }}>Winning Numbers</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
              {state.drawnNumbers.map((n, i) => (
                <div key={i} style={{
                  width: 48, height: 48, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, fontWeight: 800,
                  background: "linear-gradient(135deg, #FFD700, #FFA500)",
                  color: "#1a1040", boxShadow: "0 4px 15px rgba(255,215,0,0.3)",
                }}>{n}</div>
              ))}
            </div>
          </div>

          <div style={{
            textAlign: "center", padding: "20px", borderRadius: 16, marginBottom: 20,
            background: state.winners.length > 0
              ? "linear-gradient(135deg, rgba(74,222,128,0.15), rgba(34,197,94,0.08))"
              : "linear-gradient(135deg, rgba(251,146,60,0.12), rgba(249,115,22,0.06))",
            border: `1px solid ${state.winners.length > 0 ? "rgba(74,222,128,0.3)" : "rgba(251,146,60,0.2)"}`,
          }}>
            {state.winners.length > 0 ? (
              <>
                <div style={{ fontSize: 28, marginBottom: 6 }}>🎉</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#4ade80" }}>
                  {state.winners.map((w) => w.name).join(", ")} win{state.winners.length === 1 ? "s" : ""}!
                </div>
                <div style={{ fontSize: 14, color: "#86efac", marginTop: 4 }}>
                  Pot of ${state.pot}{state.winners.length > 1 ? ` split ${state.winners.length} ways ($${(state.pot / state.winners.length).toFixed(0)} each)` : ""}
                </div>
                <div style={{ marginTop: 12, fontSize: 12, color: "#6b6890" }}>Send winnings via:</div>
                <PaymentButtons amount={state.winners.length > 1 ? Math.floor(state.pot / state.winners.length) : state.pot} note={`Lucky Draw Week ${state.weekNumber} Winnings!`} />
              </>
            ) : (
              <>
                <div style={{ fontSize: 28, marginBottom: 6 }}>📈</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#fb923c" }}>No winner!</div>
                <div style={{ fontSize: 14, color: "#fdba74", marginTop: 4 }}>
                  ${state.pot} rolls over to Week #{state.weekNumber + 1}
                </div>
              </>
            )}
          </div>

          <div style={{ fontSize: 13, color: "#8b86ad", textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>Results</div>
          {state.players.map((p, i) => {
            const matches = matchCount(p.numbers, state.drawnNumbers);
            const isWinner = state.winners.some((w) => w.name === p.name && JSON.stringify(w.numbers) === JSON.stringify(p.numbers));
            return (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "12px 14px", borderRadius: 12, marginBottom: 6,
                background: isWinner ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${isWinner ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.05)"}`,
              }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{p.name}</span>
                  {isWinner && <span style={{ marginLeft: 8, fontSize: 14 }}>🏆</span>}
                  <div style={{ fontSize: 11, color: "#8b86ad", marginTop: 2 }}>{matches}/{PICK_COUNT} matched</div>
                </div>
                <div style={{ display: "flex", gap: 5 }}>
                  {p.numbers.map((n) => {
                    const isMatch = state.drawnNumbers.includes(n);
                    return (
                      <span key={n} style={{
                        width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 700,
                        background: isMatch ? "rgba(255,215,0,0.25)" : "rgba(255,255,255,0.06)",
                        color: isMatch ? "#FFD700" : "#555",
                        border: isMatch ? "1px solid rgba(255,215,0,0.4)" : "1px solid transparent",
                      }}>{n}</span>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <button onClick={nextWeek} style={{
            width: "100%", padding: "16px", borderRadius: 14, border: "none", cursor: "pointer",
            fontSize: 16, fontWeight: 700, marginTop: 20, letterSpacing: 0.5,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff",
          }}>Start Week #{state.weekNumber + 1} →</button>
        </div>
      )}

      {state.history.length > 0 && state.phase === "entry" && (
        <div style={{ marginTop: 30 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 13, color: "#8b86ad", textTransform: "uppercase", letterSpacing: 2 }}>Recent Draws</div>
            <button onClick={() => setPage("adminLogin")} style={{
              background: "none", border: "none", color: "#6366f1", fontSize: 12, cursor: "pointer", fontWeight: 600,
            }}>View All →</button>
          </div>
          {[...state.history].reverse().slice(0, 3).map((h) => (
            <div key={h.week} style={{
              padding: "12px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 12,
              marginBottom: 6, border: "1px solid rgba(255,255,255,0.05)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>Week #{h.week}</span>
                <span style={{ fontSize: 12, color: h.winners.length > 0 ? "#4ade80" : "#fb923c" }}>
                  {h.winners.length > 0 ? `Won by ${h.winners.map((w) => w.name).join(", ")}` : "Rolled over"}
                </span>
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                {h.drawn.map((n) => (
                  <span key={n} style={{
                    width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700, background: "rgba(255,215,0,0.12)", color: "#d4a853",
                  }}>{n}</span>
                ))}
                <span style={{ fontSize: 12, color: "#6b6890", marginLeft: "auto", alignSelf: "center" }}>
                  Pot: ${h.pot} · {h.players.length} entries
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <button onClick={resetAll} style={{
        display: "block", margin: "30px auto 0", padding: "8px 20px", borderRadius: 8,
        border: "1px solid rgba(255,255,255,0.08)", background: "transparent",
        color: "#555", fontSize: 12, cursor: "pointer",
      }}>Reset Everything</button>
    </div>
  );
}
