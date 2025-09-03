"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import AddBudgetAndExpense from "@/components/add-budget-expense";

type ItemExpense = {
  itemId: string;
  itemName: string;
  expectedBudget: number;
  totalSpent: number;
};

export default function ItemDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState<ItemExpense | null>(null);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  async function fetchData() {
    const res = await fetch(`/api/items/${id}/expenses/${year}/${month}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }

  useEffect(() => {
    if (id) fetchData();
  }, [id, year, month]);

  if (loading) return <p className="p-4">Loading...</p>;
  if (!data) return <p className="p-4">No data for this item.</p>;

  const progress = data.expectedBudget
    ? (data.totalSpent / data.expectedBudget) * 100
    : 0;

  return (
    <div className="p-6 max-w-lg mx-auto space-y-6">
      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">{data.itemName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Budget: ₹{data.expectedBudget ?? 0}</span>
            <span>Spent: ₹{data.totalSpent ?? 0}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Add Expense</CardTitle>
        </CardHeader>
        <CardContent>
          <AddBudgetAndExpense itemId={id as string} onUpdate={fetchData} />
        </CardContent>
      </Card>
    </div>
  );
}
