"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
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

function BudgetBadge({ ratio }: { ratio: number }) {
  if (!Number.isFinite(ratio) || ratio < 0)
    return <Badge variant="secondary">No Budget</Badge>;
  if (ratio < 0.5)
    return (
      <Badge className="bg-emerald-600/90 hover:bg-emerald-600 text-white">
        On Track
      </Badge>
    );
  if (ratio < 1)
    return (
      <Badge className="bg-amber-600/90 hover:bg-amber-600 text-white">
        Approaching
      </Badge>
    );
  return (
    <Badge className="bg-rose-600/90 hover:bg-rose-600 text-white">Over</Badge>
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
  const [budget, setBudget] = useState(0);

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
    [router, pathname, searchParams]
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
    } catch (error) {
      console.error("Logout failed", error);
      router.push("/login");
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

        if (data.id && budget > 0) {
          await fetch(`/api/items/${data.id}/budget`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, amount: budget }),
          });
        }

        setName("");
        setBudget(0);
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
    [selectedYear, selectedMonth]
  );

  return (
    <div
      className="p-6 space-y-6 min-h-[60vh]"
      style={{
        background:
          "radial-gradient(1200px 600px at 20% -10%, rgba(56,189,248,0.12), transparent 60%), radial-gradient(1000px 500px at 120% 10%, rgba(168,85,247,0.1), transparent 60%)",
      }}
    >
      <div className="flex justify-end">
        <Button variant="destructive" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <Card className="max-w-3xl mx-auto backdrop-blur-md bg-white/5 dark:bg-black/20 border-white/10">
        <CardHeader>
          <h2 className="text-lg font-semibold tracking-tight">Add Item</h2>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Input
            placeholder="Item name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Budget"
            type="number"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
          />
          <Button
            disabled={!name.trim() || adding}
            onClick={addItem}
            className="whitespace-nowrap"
          >
            {adding ? "Adding..." : "Add"}
          </Button>
        </CardContent>
      </Card>

      <div className="max-w-3xl mx-auto grid gap-4 sm:grid-cols-3">
        <Card className="sm:col-span-2 backdrop-blur-md bg-white/5 dark:bg-black/20 border-white/10">
          <CardHeader>
            <h2 className="text-lg font-semibold tracking-tight">
              {now.toLocaleString("en-IN", {
                month: "long",
                year: "numeric",
              })}
            </h2>
          </CardHeader>
          <CardContent className="flex gap-2">
            <select
              value={selectedMonth}
              onChange={(e) =>
                setMonthInUrl(selectedYear, Number(e.target.value))
              }
              className="w-full rounded-md bg-white/10 dark:bg-white/10 text-foreground px-3 py-2 outline-none border border-white/10 focus:border-cyan-400/50 transition-colors"
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2000, i, 1).toLocaleString("en-IN", {
                    month: "long",
                  })}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) =>
                setMonthInUrl(Number(e.target.value), selectedMonth)
              }
              className="w-full rounded-md bg-white/10 dark:bg-white/10 text-foreground px-3 py-2 outline-none border border-white/10 focus:border-cyan-400/50 transition-colors"
            >
              {Array.from({ length: 11 }).map((_, i) => {
                const y = new Date().getFullYear() - 5 + i;
                return (
                  <option key={y} value={y}>
                    {y}
                  </option>
                );
              })}
            </select>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-md bg-white/5 dark:bg-black/20 border-white/10">
          <CardHeader>
            <h3 className="text-base font-medium">Overview</h3>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Items</span>
              <span className="tabular-nums">{items.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Expected</span>
              <span className="tabular-nums">
                ₹
                {currency(
                  items.reduce((a, b) => a + (b.expectedBudget || 0), 0)
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total Spent</span>
              <span className="tabular-nums">
                ₹{currency(items.reduce((a, b) => a + (b.totalSpent || 0), 0))}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              className="backdrop-blur-sm bg-white/5 dark:bg-black/20 border-white/10"
            >
              <CardHeader>
                <Skeleton className="h-5 w-2/3" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => {
            const ratio =
              it.expectedBudget > 0 ? it.totalSpent / it.expectedBudget : NaN;
            const pct = Number.isFinite(ratio)
              ? Math.min(100, Math.max(0, Math.round(ratio * 100)))
              : 0;
            return (
              <Card
                key={it.id}
                onClick={() => router.push(`/items/${it.id}`)}
                className="cursor-pointer group relative border border-white/10 dark:border-white/10 bg-white/5 dark:bg-black/20 backdrop-blur-md rounded-xl overflow-hidden transition-transform duration-300 hover:-translate-y-0.5"
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-px rounded-[11px] bg-gradient-to-br from-cyan-400/10 via-fuchsia-400/10 to-transparent" />
                  <div className="absolute -inset-[1px] rounded-[12px] bg-[radial-gradient(120px_80px_at_0%_0%,rgba(34,211,238,0.25),transparent),radial-gradient(120px_80px_at_100%_0%,rgba(168,85,247,0.25),transparent)] blur-md" />
                </div>
                <CardHeader className="relative z-10">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold tracking-tight">{it.name}</h3>
                    <BudgetBadge ratio={ratio} />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Expected</span>
                    <span className="tabular-nums">
                      ₹{currency(it.expectedBudget)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Current</span>
                    <span className="tabular-nums">
                      ₹{currency(it.totalSpent)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <Progress value={pct} className="h-2 bg-white/10" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{pct}%</span>
                      <span
                        className={
                          ratio >= 1 ? "text-rose-500" : "text-emerald-500"
                        }
                      >
                        {ratio >= 1 ? "Over budget" : "Within budget"}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="relative z-10 flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/items/${it.id}`);
                    }}
                    className="inline-flex items-center h-8 rounded-md px-3 text-xs font-medium bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    Open
                  </button>
                </CardFooter>
                <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-white/10 group-hover:ring-cyan-400/40 transition-all duration-300" />
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
