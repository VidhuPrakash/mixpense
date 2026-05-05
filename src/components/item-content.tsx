"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { authClient } from "../../lib/auth-client";

type ItemSummary = {
  id: string;
  name: string;
  expectedBudget: number;
  totalSpent: number;
};

function currency(n: number) {
  return n.toLocaleString("en-IN");
}

const mono: React.CSSProperties = {
  fontFamily: "var(--font-dm-mono), 'Courier New', monospace",
};
const display: React.CSSProperties = {
  fontFamily: "var(--font-fraunces), Georgia, serif",
};

function StatusPip({ ratio }: { ratio: number }) {
  if (!Number.isFinite(ratio) || ratio < 0)
    return (
      <span
        style={{
          ...mono,
          fontSize: 9,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "#5e5c57",
          border: "0.5px solid rgba(255,255,255,0.1)",
          borderRadius: 3,
          padding: "2px 6px",
        }}
      >
        No Budget
      </span>
    );
  if (ratio < 0.5)
    return (
      <span
        style={{
          ...mono,
          fontSize: 9,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "#6b9e6b",
          border: "0.5px solid rgba(107,158,107,0.35)",
          borderRadius: 3,
          padding: "2px 6px",
        }}
      >
        On Track
      </span>
    );
  if (ratio < 1)
    return (
      <span
        style={{
          ...mono,
          fontSize: 9,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "#c9953a",
          border: "0.5px solid rgba(201,149,58,0.35)",
          borderRadius: 3,
          padding: "2px 6px",
        }}
      >
        Approaching
      </span>
    );
  return (
    <span
      style={{
        ...mono,
        fontSize: 9,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        color: "#c0473a",
        border: "0.5px solid rgba(192,71,58,0.35)",
        borderRadius: 3,
        padding: "2px 6px",
      }}
    >
      Over
    </span>
  );
}

export function ItemsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<ItemSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [budget, setBudget] = useState<number | "">("");

  const selectedYear =
    Number(searchParams.get("year")) || new Date().getFullYear();
  const selectedMonth =
    Number(searchParams.get("month")) || new Date().getMonth() + 1;

  const setMonthInUrl = useCallback(
    (year: number, month: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("year", String(year));
      params.set("month", String(month));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const handleLogout = useCallback(async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/");
          },
        },
      });
    } catch {
      router.push("/");
    }
  }, [router]);

  async function addItem() {
    if (!name.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.id && budget && Number(budget) > 0) {
          await fetch(`/api/items/${data.id}/budget`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, amount: Number(budget) }),
          });
        }
        setName("");
        setBudget("");
        await fetchItems();
      }
    } catch (error) {
      console.error("Error adding item:", error);
    } finally {
      setAdding(false);
    }
  }

  async function fetchItems() {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("year", String(selectedYear));
    params.set("month", String(selectedMonth));
    const res = await fetch(`/api/items/summary?${params.toString()}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      setItems(data.items as ItemSummary[]);
    } else {
      setItems([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchItems();
  }, [selectedYear, selectedMonth]);

  const now = useMemo(
    () => new Date(selectedYear, selectedMonth - 1, 1),
    [selectedYear, selectedMonth],
  );

  const totalBudget = items.reduce((a, b) => a + (b.expectedBudget || 0), 0);
  const totalSpent = items.reduce((a, b) => a + (b.totalSpent || 0), 0);
  const totalOver = totalSpent > totalBudget && totalBudget > 0;

  return (
    <div className="ledger-page">
      <div
        style={{
          maxWidth: 860,
          margin: "0 auto",
          padding: "40px 20px 72px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {/* ── HEADER ── */}
        <div
          className="ledger-slide-down"
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <div>
            <p className="ledger-label" style={{ marginBottom: 6 }}>
              Mixpense
            </p>
            <h1
              style={{
                ...display,
                fontSize: 32,
                fontWeight: 500,
                color: "#e8e6df",
                letterSpacing: "-0.025em",
                lineHeight: 1,
                margin: 0,
              }}
            >
              {now.toLocaleString("en-IN", { month: "long", year: "numeric" })}
            </h1>
          </div>
          <button
            className="ledger-btn-ghost"
            style={{ padding: "8px 18px" }}
            onClick={handleLogout}
          >
            Sign Out
          </button>
        </div>

        {/* ── OVERVIEW + PERIOD ── */}
        <div
          className="ledger-fade-up ledger-responsive-row"
          style={{ gap: 10, animationDelay: "0.06s" }}
        >
          {/* Period picker */}
          <div
            className="ledger-card ledger-period-card"
            style={{ padding: "20px 22px" }}
          >
            <p className="ledger-label" style={{ marginBottom: 14 }}>
              Period
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="ledger-label" style={{ marginBottom: 6 }}>
                  Month
                </p>
                <select
                  value={selectedMonth}
                  onChange={(e) =>
                    setMonthInUrl(selectedYear, Number(e.target.value))
                  }
                  style={{
                    ...mono,
                    width: "100%",
                    background: "#1e1e1b",
                    border: "0.5px solid rgba(255,255,255,0.1)",
                    borderRadius: 4,
                    color: "#e8e6df",
                    fontSize: 13,
                    padding: "10px 12px",
                    outline: "none",
                    appearance: "none",
                    cursor: "pointer",
                  }}
                >
                  {Array.from({ length: 12 }).map((_, i) => (
                    <option
                      key={i + 1}
                      value={i + 1}
                      style={{ background: "#1e1e1b" }}
                    >
                      {new Date(2000, i, 1).toLocaleString("en-IN", {
                        month: "long",
                      })}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ flex: "0 0 100px" }}>
                <p className="ledger-label" style={{ marginBottom: 6 }}>
                  Year
                </p>
                <select
                  value={selectedYear}
                  onChange={(e) =>
                    setMonthInUrl(Number(e.target.value), selectedMonth)
                  }
                  style={{
                    ...mono,
                    width: "100%",
                    background: "#1e1e1b",
                    border: "0.5px solid rgba(255,255,255,0.1)",
                    borderRadius: 4,
                    color: "#e8e6df",
                    fontSize: 13,
                    padding: "10px 12px",
                    outline: "none",
                    appearance: "none",
                    cursor: "pointer",
                  }}
                >
                  {Array.from({ length: 11 }).map((_, i) => {
                    const y = new Date().getFullYear() - 5 + i;
                    return (
                      <option
                        key={y}
                        value={y}
                        style={{ background: "#1e1e1b" }}
                      >
                        {y}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          {/* Overview card */}
          <div
            className="ledger-card ledger-overview-card"
            style={{ padding: "20px 22px" }}
          >
            <p className="ledger-label" style={{ marginBottom: 14 }}>
              Overview
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <p className="ledger-label">Items</p>
                <span style={{ ...mono, fontSize: 14, color: "#e8e6df" }}>
                  {items.length}
                </span>
              </div>
              <hr className="ledger-divider" />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <p className="ledger-label">Budget</p>
                <span style={{ ...mono, fontSize: 14, color: "#c9953a" }}>
                  ₹{currency(totalBudget)}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <p className="ledger-label">Spent</p>
                <span
                  style={{
                    ...mono,
                    fontSize: 14,
                    color: totalOver ? "#c0473a" : "#e8e6df",
                  }}
                >
                  ₹{currency(totalSpent)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── ADD ITEM ── */}
        <div
          className="ledger-fade-up ledger-card"
          style={{ padding: "20px 22px", animationDelay: "0.12s" }}
        >
          <p className="ledger-label" style={{ marginBottom: 14 }}>
            New Item
          </p>
          <div className="ledger-add-row">
            <div className="ledger-add-name">
              <p className="ledger-label" style={{ marginBottom: 6 }}>
                Name
              </p>
              <input
                className="ledger-input"
                style={{ width: "100%", padding: "10px 12px" }}
                placeholder="Item name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addItem();
                }}
              />
            </div>
            <div className="ledger-add-budget">
              <p className="ledger-label" style={{ marginBottom: 6 }}>
                Budget
              </p>
              <input
                type="number"
                className="ledger-input"
                style={{ width: "100%", padding: "10px 12px" }}
                placeholder="₹0"
                value={budget}
                onChange={(e) =>
                  setBudget(e.target.value === "" ? "" : Number(e.target.value))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") addItem();
                }}
              />
            </div>
            <div className="ledger-add-action">
              <p
                className="ledger-label"
                style={{ marginBottom: 6, visibility: "hidden" }}
              >
                &nbsp;
              </p>
              <button
                className="ledger-btn-primary"
                style={{
                  width: "100%",
                  padding: "10px 22px",
                  whiteSpace: "nowrap",
                }}
                onClick={addItem}
                disabled={!name.trim() || adding}
              >
                {adding ? "Adding…" : "Add Item"}
              </button>
            </div>
          </div>
        </div>

        {/* ── ITEMS GRID ── */}
        {loading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 10,
              marginTop: 2,
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="ledger-card"
                style={{ height: 140, opacity: 0.4 + i * 0.04 }}
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div
            className="ledger-fade-up ledger-card"
            style={{
              padding: "48px 28px",
              textAlign: "center",
              animationDelay: "0.18s",
            }}
          >
            <p style={{ ...mono, color: "#5e5c57", fontSize: 12 }}>
              No items for this period.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 10,
              marginTop: 2,
            }}
          >
            {items.map((it, idx) => {
              const ratio =
                it.expectedBudget > 0 ? it.totalSpent / it.expectedBudget : NaN;
              const pct = Number.isFinite(ratio)
                ? Math.min(100, Math.max(0, Math.round(ratio * 100)))
                : 0;
              const over = ratio >= 1;

              return (
                <div
                  key={it.id}
                  className="ledger-fade-up ledger-card"
                  style={{
                    padding: "20px 22px",
                    cursor: "pointer",
                    animationDelay: `${0.16 + idx * 0.045}s`,
                    transition: "border-color 0.18s",
                  }}
                  onClick={() => router.push(`/items/${it.id}`)}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor =
                      "rgba(201,149,58,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor =
                      "rgba(255,255,255,0.07)";
                  }}
                >
                  {/* Row 1 — name + status */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 10,
                      marginBottom: 18,
                    }}
                  >
                    <h3
                      style={{
                        ...display,
                        fontSize: 18,
                        fontWeight: 500,
                        color: "#e8e6df",
                        letterSpacing: "-0.02em",
                        lineHeight: 1.2,
                        margin: 0,
                      }}
                    >
                      {it.name}
                    </h3>
                    <StatusPip ratio={ratio} />
                  </div>

                  {/* Row 2 — figures */}
                  <div
                    className="ledger-surface"
                    style={{
                      padding: "12px 14px",
                      marginBottom: 14,
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <p className="ledger-label" style={{ marginBottom: 4 }}>
                        Budget
                      </p>
                      <p
                        style={{
                          ...mono,
                          fontSize: 14,
                          color: "#c9953a",
                          margin: 0,
                        }}
                      >
                        ₹{currency(it.expectedBudget)}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p className="ledger-label" style={{ marginBottom: 4 }}>
                        Spent
                      </p>
                      <p
                        style={{
                          ...mono,
                          fontSize: 14,
                          color: over ? "#c0473a" : "#e8e6df",
                          margin: 0,
                        }}
                      >
                        ₹{currency(it.totalSpent)}
                      </p>
                    </div>
                  </div>

                  {/* Row 3 — progress */}
                  <div style={{ marginBottom: 16 }}>
                    <div className="ledger-progress-track">
                      <div
                        className="ledger-progress-fill"
                        style={{
                          width: `${pct}%`,
                          background: over ? "#c0473a" : "#c9953a",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: 6,
                      }}
                    >
                      <p className="ledger-label">{pct}%</p>
                      <p
                        className="ledger-label"
                        style={{ color: over ? "#c0473a" : "#5e5c57" }}
                      >
                        {over ? "Over budget" : "Within budget"}
                      </p>
                    </div>
                  </div>

                  {/* Row 4 — open button */}
                  <button
                    className="ledger-btn-ghost"
                    style={{ width: "100%", padding: "8px" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/items/${it.id}`);
                    }}
                  >
                    Open
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
