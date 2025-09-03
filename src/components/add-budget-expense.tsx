"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  itemId: string;
  onUpdate: () => void;
}

export default function AddBudgetAndExpense({ itemId, onUpdate }: Props) {
  const [expenseAmount, setExpenseAmount] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function addExpense() {
    if (expenseAmount === "") return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/items/${itemId}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: expenseAmount }),
      });
      if (!res.ok) throw new Error("Failed to add expense");
      setExpenseAmount("");
      onUpdate();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-red-600">{error}</p>}

      <div className="flex flex-col space-y-2">
        <Input
          placeholder="Add Expense Amount"
          type="number"
          value={expenseAmount}
          onChange={(e) =>
            setExpenseAmount(
              e.target.value === "" ? "" : Number(e.target.value)
            )
          }
        />
        <Button onClick={addExpense} disabled={loading || expenseAmount === ""}>
          Add Expense
        </Button>
      </div>
    </div>
  );
}
