"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  itemId: string;
  onUpdate: () => void;
}

export default function AddBudget({ itemId, onUpdate }: Props) {
  const [budgetName, setBudgetName] = useState("");
  const [budgetAmount, setBudgetAmount] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function addBudget() {
    if (!budgetName.trim() || budgetAmount === "") return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/items/${itemId}/budget`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: budgetName, amount: budgetAmount }),
      });
      if (!res.ok) throw new Error("Failed to add budget");
      setBudgetName("");
      setBudgetAmount("");
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
      <Input
        placeholder="Budget Name"
        value={budgetName}
        onChange={(e) => setBudgetName(e.target.value)}
      />
      <Input
        placeholder="Budget Amount"
        type="number"
        value={budgetAmount}
        onChange={(e) =>
          setBudgetAmount(e.target.value === "" ? "" : Number(e.target.value))
        }
      />
      <Button
        onClick={addBudget}
        disabled={loading || !budgetName.trim() || budgetAmount === ""}
      >
        Add Budget
      </Button>
    </div>
  );
}
