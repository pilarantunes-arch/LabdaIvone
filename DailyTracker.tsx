import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Plus, Flame, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useTracker } from "@/context/TrackerContext";
import { useLocale } from "@/context/LocaleContext";
import { useAuth } from "@/context/AuthContext";

const initialGoals = [
  { id: "g1", text: "Take morning supplements", completed: false },
  { id: "g2", text: "Eat 25g+ protein", completed: false },
  { id: "g3", text: "Hydrate (64oz)", completed: false },
  { id: "g4", text: "10 min mindful breathing", completed: false },
];

export default function DailyTracker() {
  const { user, users, products, updateClientProfile } = useAuth();
  const { streak, goalsCompletedToday, completeDailyGoal, resetTodayGoal, streakRewardUnlocked } = useTracker();
  const { t } = useLocale();

  const [logs, setLogs] = useState<{ id: string; name: string; quantity: number }[]>([]);
  const [guestGoals, setGuestGoals] = useState(initialGoals);
  const [isAdding, setIsAdding] = useState(false);
  const [newLogName, setNewLogName] = useState("");
  const [newLogQty, setNewLogQty] = useState("1");

  const activeClient = user?.role === "customer" ? users.find((client) => client.id === user.id) : null;
  const goals = activeClient?.goals || guestGoals;
  const allGoalsComplete = goals.every((g) => g.completed);
  const productNames = products.map((p) => p.name);
  const displayStreak = activeClient?.streak ?? streak;
  const rewardUnlocked = displayStreak >= 7 || streakRewardUnlocked;

  useEffect(() => {
    if (allGoalsComplete && !goalsCompletedToday) {
      completeDailyGoal();
    } else if (!allGoalsComplete && goalsCompletedToday) {
      resetTodayGoal();
    }
  }, [allGoalsComplete, goalsCompletedToday, completeDailyGoal, resetTodayGoal]);

  useEffect(() => {
    if (!activeClient || activeClient.goalCompleted === allGoalsComplete) return;

    updateClientProfile(activeClient.id, (profile) => ({
      ...profile,
      goalCompleted: allGoalsComplete,
      streak: allGoalsComplete ? Math.max(profile.streak, profile.streak + 1) : profile.streak,
    }));
  }, [activeClient, allGoalsComplete, updateClientProfile]);

  const handleAddLog = () => {
    if (!newLogName) return;
    setLogs([...logs, { id: Math.random().toString(), name: newLogName, quantity: parseInt(newLogQty) || 1 }]);
    setIsAdding(false);
    setNewLogName("");
    setNewLogQty("1");
  };

  const toggleGoal = (id: string) => {
    if (activeClient) {
      updateClientProfile(activeClient.id, (profile) => {
        const nextGoals = profile.goals.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g));
        return { ...profile, goals: nextGoals, goalCompleted: nextGoals.every((goal) => goal.completed) };
      });
      return;
    }

    setGuestGoals(goals.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g)));
  };

  const today = format(new Date(), "EEEE, MMMM do");
  const completedCount = goals.filter((g) => g.completed).length;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif text-foreground tracking-tight mb-2">
            {t("nav.tracker")}
          </h1>
          <p className="text-muted-foreground font-light">{today}</p>
        </div>
        <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-md px-4 py-3">
          <Flame className="h-6 w-6 text-orange-500" />
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{t("tracker.streak")}</p>
            <p className="text-2xl font-serif font-medium">{displayStreak} {t("tracker.days")}</p>
          </div>
        </div>
      </div>

      {activeClient && (
        <Card className="border-[#4A5D4E]/20 bg-[#4A5D4E]/5 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-medium">{t("tracker.dailyChallengeTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">{activeClient.currentChallenge}</p>
          </CardContent>
        </Card>
      )}

      <Card className={`border-2 ${rewardUnlocked ? "border-primary bg-primary/5" : "border-dashed border-primary/30 bg-primary/5"}`}>
        <CardContent className="pt-6 pb-6 flex items-start gap-4">
          <Gift className={`h-8 w-8 shrink-0 ${rewardUnlocked ? "text-primary" : "text-muted-foreground"}`} />
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-medium">{t("tracker.rewardTitle")}</h3>
              {rewardUnlocked && (
                <Badge className="bg-primary text-primary-foreground rounded-sm">{t("tracker.unlocked")}</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{t("tracker.rewardDesc")}</p>
            <Progress value={Math.min(100, (displayStreak / 7) * 100)} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground">{displayStreak}/7 {t("tracker.days")}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-medium flex justify-between items-center">
                <span>{t("tracker.consumedToday")}</span>
                {!isAdding && (
                  <Button variant="outline" size="sm" onClick={() => setIsAdding(true)} className="rounded-sm">
                    <Plus className="h-4 w-4 mr-1" /> {t("tracker.addEntry")}
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isAdding && (
                <div className="bg-muted/30 p-4 rounded-md mb-6 flex flex-col sm:flex-row gap-4 items-end sm:items-center">
                  <div className="flex-1 w-full">
                    <Label htmlFor="product" className="mb-2 block text-xs">{t("tracker.product")}</Label>
                    <Select onValueChange={setNewLogName} value={newLogName}>
                      <SelectTrigger id="product" className="bg-background">
                        <SelectValue placeholder={t("tracker.selectProduct")} />
                      </SelectTrigger>
                      <SelectContent>
                        {productNames.map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full sm:w-24">
                    <Label htmlFor="qty" className="mb-2 block text-xs">{t("tracker.qty")}</Label>
                    <Input id="qty" type="number" min="1" value={newLogQty} onChange={(e) => setNewLogQty(e.target.value)} className="bg-background" />
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="ghost" onClick={() => setIsAdding(false)} className="flex-1">{t("tracker.cancel")}</Button>
                    <Button onClick={handleAddLog} className="flex-1 bg-foreground text-background">{t("tracker.add")}</Button>
                  </div>
                </div>
              )}

              {logs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">{t("tracker.noLogs")}</div>
              ) : (
                <ul className="divide-y divide-border">
                  {logs.map((log) => (
                    <li key={log.id} className="py-3 flex justify-between items-center">
                      <span className="font-medium text-sm">{log.name}</span>
                      <span className="text-muted-foreground text-sm">{t("tracker.qty")}: {log.quantity}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1">
          <Card className="border-border/50 shadow-sm bg-primary/5 border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg font-medium flex justify-between items-center">
                {t("tracker.todaysGoals")}
                <span className="text-sm font-normal text-muted-foreground">{completedCount}/{goals.length}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {goals.map((goal) => (
                  <div key={goal.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={goal.id}
                      checked={goal.completed}
                      onCheckedChange={() => toggleGoal(goal.id)}
                      className="mt-0.5"
                    />
                    <label
                      htmlFor={goal.id}
                      className={`text-sm leading-tight cursor-pointer transition-colors ${goal.completed ? "text-muted-foreground line-through" : "text-foreground"}`}
                    >
                      {goal.text}
                    </label>
                  </div>
                ))}
              </div>
              {allGoalsComplete && (
                <p className="text-xs text-primary mt-4 font-medium">{t("tracker.goalComplete")}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
