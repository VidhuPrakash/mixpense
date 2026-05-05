"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type ItemData = {
  itemId: string;
  itemName: string;
  expectedBudget: number;
  totalSpent: number;
};

type ExpenseItem = {
  id: string;
  itemId: string;
  amount: number;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ItemDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<ItemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [expensesLoading, setExpensesLoading] = useState(true);

  // Name edit
  const [editingName, setEditingName] = useState(false);
  const [editName, setEditName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  // Budget edit
  const [editingBudget, setEditingBudget] = useState(false);
  const [editBudget, setEditBudget] = useState<number | "">("");
  const [savingBudget, setSavingBudget] = useState(false);
  const [budgetError, setBudgetError] = useState<string | null>(null);

  // Per-expense inline edit
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<number | "">("");
  const [editNote, setEditNote] = useState("");
  const [savingExpense, setSavingExpense] = useState(false);
  const [expenseError, setExpenseError] = useState<string | null>(null);

  // Delete item
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Add expense
  const [addAmount, setAddAmount] = useState<number | "">("");
  const [addNote, setAddNote] = useState("");
  const [addingExpense, setAddingExpense] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  async function fetchData() {
    setError(null);
    try {
      const res = await fetch(`/api/items/${id}/expenses/${year}/${month}`);
      if (!res.ok) {
        setError("Failed to load item data.");
        setData(null);
        return;
      }
      const json: ItemData = await res.json();
      setData(json.itemName ? json : null);
    } catch {
      setError("Something went wrong.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  async function fetchExpenses() {
    try {
      const res = await fetch(
        `/api/items/${id}/expenses/list?year=${year}&month=${month}`,
      );
      if (res.ok) {
        const json = await res.json();
        setExpenses(json.expenses ?? []);
      }
    } catch {
      // non-critical
    } finally {
      setExpensesLoading(false);
    }
  }

  async function refresh() {
    await Promise.all([fetchData(), fetchExpenses()]);
  }

  async function deleteItem() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      router.push("/items");
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  async function saveName() {
    if (!editName.trim()) return;
    setSavingName(true);
    setNameError(null);
    try {
      const res = await fetch(`/api/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setNameError((json as { error?: string }).error ?? "Failed to save.");
        return;
      }
      setEditingName(false);
      await fetchData();
    } catch {
      setNameError("Something went wrong.");
    } finally {
      setSavingName(false);
    }
  }

  async function saveBudget() {
    if (editBudget === "") return;
    setSavingBudget(true);
    setBudgetError(null);
    try {
      const res = await fetch(`/api/items/${id}/budget`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(editBudget) }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setBudgetError((json as { error?: string }).error ?? "Failed to save.");
        return;
      }
      setEditingBudget(false);
      await fetchData();
    } catch {
      setBudgetError("Something went wrong.");
    } finally {
      setSavingBudget(false);
    }
  }

  async function saveExpense(expenseId: string) {
    setSavingExpense(true);
    setExpenseError(null);
    try {
      const body: { amount?: number; description?: string } = {
        description: editNote,
      };
      if (editAmount !== "") body.amount = Number(editAmount);
      const res = await fetch(`/api/items/${id}/expenses/${expenseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setExpenseError(
          (json as { error?: string }).error ?? "Failed to save.",
        );
        return;
      }
      setEditingExpenseId(null);
      await refresh();
    } catch {
      setExpenseError("Something went wrong.");
    } finally {
      setSavingExpense(false);
    }
  }

  async function addExpense() {
    if (addAmount === "" || Number(addAmount) <= 0) return;
    setAddingExpense(true);
    setAddError(null);
    try {
      const res = await fetch(`/api/items/${id}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(addAmount),
          ...(addNote.trim() && { description: addNote.trim() }),
        }),
      });
      if (!res.ok) throw new Error("Failed to add expense");
      setAddAmount("");
      setAddNote("");
      await refresh();
    } catch (err) {
      setAddError((err as Error).message);
    } finally {
      setAddingExpense(false);
    }
  }

  useEffect(() => {
    if (id) {
      fetchData();
      fetchExpenses();
    }
  }, [id, year, month]);

  const S = {
    page: {
      background: "#0f0f0d",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    } as React.CSSProperties,
    mono: {
      fontFamily: "var(--font-dm-mono), 'Courier New', monospace",
    } as React.CSSProperties,
    display: {
      fontFamily: "var(--font-fraunces), Georgia, serif",
    } as React.CSSProperties,
  };

  if (loading)
    return (
      <div style={S.page}>
        <p className="ledger-label">Loading</p>
      </div>
    );
  if (error)
    return (
      <div style={S.page}>
        <p style={{ ...S.mono, color: "#c0473a", fontSize: 13 }}>{error}</p>
      </div>
    );
  if (!data)
    return (
      <div style={S.page}>
        <p className="ledger-label">Item not found.</p>
      </div>
    );

  const isOverBudget = (data.totalSpent ?? 0) > (data.expectedBudget ?? 0);
  const remaining = (data.expectedBudget ?? 0) - (data.totalSpent ?? 0);
  const progress = data.expectedBudget
    ? Math.min(100, (data.totalSpent / data.expectedBudget) * 100)
    : 0;
  const currentMonth = new Date().toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="ledger-page">
      <div
        style={{
          maxWidth: 540,
          margin: "0 auto",
          padding: "48px 20px 64px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {/* ── NAME ── */}
        <div
          className="ledger-slide-down ledger-card"
          style={{ padding: "24px 28px" }}
        >
          {editingName ? (
            <div>
              <p className="ledger-label" style={{ marginBottom: 12 }}>
                Rename Item
              </p>
              <input
                className="ledger-input"
                style={{ width: "100%", padding: "10px 12px", marginBottom: 8 }}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveName();
                  if (e.key === "Escape") {
                    setEditingName(false);
                    setNameError(null);
                  }
                }}
              />
              {nameError && (
                <p
                  style={{
                    ...S.mono,
                    color: "#c0473a",
                    fontSize: 11,
                    marginBottom: 8,
                  }}
                >
                  {nameError}
                </p>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="ledger-btn-primary"
                  style={{ padding: "8px 18px" }}
                  onClick={saveName}
                  disabled={savingName || !editName.trim()}
                >
                  {savingName ? "Saving" : "Save"}
                </button>
                <button
                  className="ledger-btn-ghost"
                  style={{ padding: "8px 18px" }}
                  onClick={() => {
                    setEditingName(false);
                    setNameError(null);
                  }}
                  disabled={savingName}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <div>
                <p className="ledger-label" style={{ marginBottom: 8 }}>
                  Item
                </p>
                <h1
                  style={{
                    ...S.display,
                    fontSize: 30,
                    fontWeight: 500,
                    color: "#e8e6df",
                    letterSpacing: "-0.02em",
                    lineHeight: 1.1,
                    margin: 0,
                  }}
                >
                  {data.itemName}
                </h1>
              </div>
              <div
                style={{ display: "flex", gap: 8, flexShrink: 0, marginTop: 2 }}
              >
                <button
                  className="ledger-btn-ghost"
                  style={{ padding: "7px 14px" }}
                  onClick={() => {
                    setEditName(data.itemName);
                    setEditingName(true);
                  }}
                >
                  Edit
                </button>
                {confirmDelete ? (
                  <>
                    <button
                      className="ledger-btn-ghost"
                      style={{
                        padding: "7px 14px",
                        borderColor: "rgba(192,71,58,0.5)",
                        color: "#c0473a",
                      }}
                      onClick={deleteItem}
                      disabled={deleting}
                    >
                      {deleting ? "Deleting…" : "Confirm"}
                    </button>
                    <button
                      className="ledger-btn-ghost"
                      style={{ padding: "7px 14px" }}
                      onClick={() => setConfirmDelete(false)}
                      disabled={deleting}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    className="ledger-btn-ghost"
                    style={{
                      padding: "7px 14px",
                      borderColor: "rgba(192,71,58,0.3)",
                      color: "#c0473a",
                    }}
                    onClick={() => setConfirmDelete(true)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── BUDGET ── */}
        <div
          className="ledger-fade-up ledger-card"
          style={{ padding: "24px 28px", animationDelay: "0.07s" }}
        >
          {editingBudget ? (
            <div>
              <p className="ledger-label" style={{ marginBottom: 12 }}>
                Budget Amount
              </p>
              <input
                type="number"
                className="ledger-input"
                style={{ width: "100%", padding: "10px 12px", marginBottom: 8 }}
                value={editBudget}
                onChange={(e) =>
                  setEditBudget(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveBudget();
                  if (e.key === "Escape") {
                    setEditingBudget(false);
                    setBudgetError(null);
                  }
                }}
              />
              {budgetError && (
                <p
                  style={{
                    ...S.mono,
                    color: "#c0473a",
                    fontSize: 11,
                    marginBottom: 8,
                  }}
                >
                  {budgetError}
                </p>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="ledger-btn-primary"
                  style={{ padding: "8px 18px" }}
                  onClick={saveBudget}
                  disabled={savingBudget || editBudget === ""}
                >
                  {savingBudget ? "Saving" : "Save"}
                </button>
                <button
                  className="ledger-btn-ghost"
                  style={{ padding: "8px 18px" }}
                  onClick={() => {
                    setEditingBudget(false);
                    setBudgetError(null);
                  }}
                  disabled={savingBudget}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: 22,
                  gap: 16,
                }}
              >
                <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
                  {/* Budget */}
                  <div>
                    <p className="ledger-label" style={{ marginBottom: 5 }}>
                      Budget
                    </p>
                    <p
                      style={{
                        ...S.mono,
                        fontSize: 20,
                        fontWeight: 500,
                        color: "#c9953a",
                        margin: 0,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      ₹{(data.expectedBudget ?? 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                  {/* Spent */}
                  <div>
                    <p className="ledger-label" style={{ marginBottom: 5 }}>
                      Spent
                    </p>
                    <p
                      style={{
                        ...S.mono,
                        fontSize: 20,
                        fontWeight: 500,
                        color: isOverBudget ? "#c0473a" : "#e8e6df",
                        margin: 0,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      ₹{(data.totalSpent ?? 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                  {/* Remaining */}
                  <div>
                    <p className="ledger-label" style={{ marginBottom: 5 }}>
                      {isOverBudget ? "Over" : "Remaining"}
                    </p>
                    <p
                      style={{
                        ...S.mono,
                        fontSize: 20,
                        fontWeight: 500,
                        color: isOverBudget ? "#c0473a" : "#9a9890",
                        margin: 0,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {isOverBudget ? "+" : ""}₹
                      {Math.abs(remaining).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
                <button
                  className="ledger-btn-ghost"
                  style={{ padding: "7px 14px", flexShrink: 0 }}
                  onClick={() => {
                    setEditBudget(data.expectedBudget ?? 0);
                    setEditingBudget(true);
                  }}
                >
                  Edit
                </button>
              </div>

              {/* Progress bar */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <p
                    className="ledger-label"
                    style={{ color: isOverBudget ? "#c0473a" : "#5e5c57" }}
                  >
                    {isOverBudget
                      ? "Over budget"
                      : `${Math.round(progress)}% allocated`}
                  </p>
                  <p
                    className="ledger-label"
                    style={{ color: isOverBudget ? "#c0473a" : "#5e5c57" }}
                  >
                    {isOverBudget
                      ? `₹${Math.abs(remaining).toLocaleString("en-IN")} over`
                      : `₹${remaining.toLocaleString("en-IN")} left`}
                  </p>
                </div>
                <div className="ledger-progress-track">
                  <div
                    className="ledger-progress-fill"
                    style={{
                      width: `${progress}%`,
                      background: isOverBudget ? "#c0473a" : "#c9953a",
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── NEW ENTRY ── */}
        <div
          className="ledger-fade-up ledger-card"
          style={{ padding: "24px 28px", animationDelay: "0.14s" }}
        >
          <p className="ledger-label" style={{ marginBottom: 16 }}>
            New Entry
          </p>
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <div style={{ flex: "0 0 120px" }}>
              <p className="ledger-label" style={{ marginBottom: 6 }}>
                Amount
              </p>
              <input
                type="number"
                className="ledger-input"
                style={{ width: "100%", padding: "10px 12px" }}
                placeholder="₹0"
                value={addAmount}
                onChange={(e) =>
                  setAddAmount(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") addExpense();
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <p className="ledger-label" style={{ marginBottom: 6 }}>
                Note
              </p>
              <input
                className="ledger-input"
                style={{ width: "100%", padding: "10px 12px" }}
                placeholder="Optional"
                value={addNote}
                onChange={(e) => setAddNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addExpense();
                }}
              />
            </div>
          </div>
          {addError && (
            <p
              style={{
                ...S.mono,
                color: "#c0473a",
                fontSize: 11,
                marginBottom: 8,
              }}
            >
              {addError}
            </p>
          )}
          <button
            className="ledger-btn-primary"
            style={{ width: "100%", padding: "11px" }}
            onClick={addExpense}
            disabled={
              addingExpense || addAmount === "" || Number(addAmount) <= 0
            }
          >
            {addingExpense ? "Recording…" : "Record Expense"}
          </button>
        </div>

        {/* ── LEDGER ── */}
        <div
          className="ledger-fade-up ledger-card"
          style={{ padding: "24px 28px", animationDelay: "0.21s" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <p className="ledger-label">Ledger · {currentMonth}</p>
            <p className="ledger-label">
              {expenses.length} {expenses.length === 1 ? "entry" : "entries"}
            </p>
          </div>

          {expensesLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="ledger-surface"
                  style={{ height: 54, borderRadius: 6, opacity: 0.5 }}
                />
              ))}
            </div>
          ) : expenses.length === 0 ? (
            <div style={{ padding: "32px 0", textAlign: "center" }}>
              <p style={{ ...S.mono, color: "#5e5c57", fontSize: 12 }}>
                No entries for this period.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {expenses.map((exp) => {
                const isEdited = exp.updatedAt !== exp.createdAt;
                const isEditingThis = editingExpenseId === exp.id;
                return (
                  <div
                    key={exp.id}
                    className="ledger-surface"
                    style={{ padding: "14px 16px" }}
                  >
                    {isEditingThis ? (
                      <div>
                        <div
                          style={{ display: "flex", gap: 10, marginBottom: 8 }}
                        >
                          <input
                            type="number"
                            className="ledger-input"
                            style={{ width: 120, padding: "8px 10px" }}
                            value={editAmount}
                            onChange={(e) =>
                              setEditAmount(
                                e.target.value === ""
                                  ? ""
                                  : Number(e.target.value),
                              )
                            }
                            placeholder="₹0"
                            autoFocus
                          />
                          <input
                            className="ledger-input"
                            style={{ flex: 1, padding: "8px 10px" }}
                            value={editNote}
                            onChange={(e) => setEditNote(e.target.value)}
                            placeholder="Note"
                          />
                        </div>
                        {expenseError && (
                          <p
                            style={{
                              ...S.mono,
                              color: "#c0473a",
                              fontSize: 11,
                              marginBottom: 8,
                            }}
                          >
                            {expenseError}
                          </p>
                        )}
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            className="ledger-btn-primary"
                            style={{ padding: "6px 14px", fontSize: 10 }}
                            onClick={() => saveExpense(exp.id)}
                            disabled={savingExpense || editAmount === ""}
                          >
                            {savingExpense ? "Saving" : "Save"}
                          </button>
                          <button
                            className="ledger-btn-ghost"
                            style={{ padding: "6px 14px", fontSize: 10 }}
                            onClick={() => {
                              setEditingExpenseId(null);
                              setExpenseError(null);
                            }}
                            disabled={savingExpense}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: 12,
                        }}
                      >
                        <div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              marginBottom: 4,
                            }}
                          >
                            <span
                              style={{
                                ...S.mono,
                                fontSize: 16,
                                fontWeight: 500,
                                color: "#c9953a",
                                letterSpacing: "-0.02em",
                              }}
                            >
                              ₹{exp.amount.toLocaleString("en-IN")}
                            </span>
                            {isEdited && (
                              <span
                                style={{
                                  ...S.mono,
                                  fontSize: 9,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.1em",
                                  color: "#5e5c57",
                                  border: "0.5px solid rgba(255,255,255,0.1)",
                                  borderRadius: 3,
                                  padding: "2px 6px",
                                }}
                              >
                                Edited
                              </span>
                            )}
                          </div>
                          {exp.description && (
                            <p
                              style={{
                                ...S.mono,
                                fontSize: 12,
                                color: "#9a9890",
                                margin: "0 0 3px",
                              }}
                            >
                              {exp.description}
                            </p>
                          )}
                          <p
                            style={{
                              ...S.mono,
                              fontSize: 10,
                              color: "#5e5c57",
                              margin: 0,
                            }}
                          >
                            {formatDate(exp.createdAt)}
                            {isEdited && (
                              <span style={{ color: "#3e3c38", marginLeft: 8 }}>
                                · edited {formatDate(exp.updatedAt)}
                              </span>
                            )}
                          </p>
                        </div>
                        <button
                          className="ledger-btn-ghost"
                          style={{
                            padding: "5px 12px",
                            fontSize: 10,
                            flexShrink: 0,
                          }}
                          onClick={() => {
                            setEditingExpenseId(exp.id);
                            setEditAmount(exp.amount);
                            setEditNote(exp.description ?? "");
                            setExpenseError(null);
                          }}
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
