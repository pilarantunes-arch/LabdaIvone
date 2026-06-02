import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type AuthMode = "signin" | "signup";

export default function Login() {
  const { login, register, continueAsGuest } = useAuth();
  const { locale, setLocale, t } = useLocale();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [usertag, setUsertag] = useState("");

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const result = login(email, password);
    if (!result.success) {
      setError(t("login.invalidCredentials"));
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const result = register({ name: `${name} ${surname}`.trim(), email, password, usertag });
    if (!result.success) {
      setError(result.error || "An error occurred during registration");
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#F4F5F0] px-4 font-sans text-foreground">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <div className="inline-flex rounded-full border border-[#4A5D4E]/15 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setLocale("pt-PT")}
              className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                locale === "pt-PT" ? "bg-[#4A5D4E] text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Português
            </button>
            <button
              type="button"
              onClick={() => setLocale("en")}
              className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                locale === "en" ? "bg-[#4A5D4E] text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              English
            </button>
          </div>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-4xl font-serif text-[#4A5D4E] tracking-tight">Labdaivone</h1>
          <p className="text-muted-foreground font-light text-lg">
            {mode === "signin" ? t("login.title") : t("login.signUpTitle")}
          </p>
        </div>

        <Card className="flex rounded-md overflow-hidden border border-border/50 bg-white shadow-sm">
          <CardContent className="p-6 w-full">
            <div className="flex bg-muted p-1 rounded-md mb-6">
              <button
                type="button"
                onClick={() => { setMode("signin"); setError(""); }}
                className={`flex-1 py-1.5 text-sm font-medium rounded-sm transition-all ${
                  mode === "signin" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("login.signIn")}
              </button>
              <button
                type="button"
                onClick={() => { setMode("signup"); setError(""); }}
                className={`flex-1 py-1.5 text-sm font-medium rounded-sm transition-all ${
                  mode === "signup" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("login.signUp")}
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                {error}
              </div>
            )}

            <form onSubmit={mode === "signin" ? handleSignIn : handleSignUp} className="space-y-4">
              {mode === "signup" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">{t("login.firstName")}</label>
                      <Input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="John" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">{t("login.lastName")}</label>
                      <Input type="text" required value={surname} onChange={(e) => setSurname(e.target.value)} placeholder="Doe" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">{t("login.usertag")}</label>
                    <Input type="text" required value={usertag} onChange={(e) => setUsertag(e.target.value)} placeholder="@johndoe" />
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">{t("login.emailLabel")}</label>
                <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("login.email")} />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">{t("login.password")}</label>
                <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("login.password")} />
              </div>

              <Button type="submit" className="w-full bg-[#4A5D4E] hover:bg-[#3b4c3e] text-white mt-2">
                {mode === "signin" ? t("login.signIn") : t("login.createAccount")}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">{t("login.or")}</span>
              </div>
            </div>

            <Button type="button" variant="outline" onClick={continueAsGuest} className="w-full border-border/60 hover:bg-muted/50">
              {t("login.browseGuest")}
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          {t("login.guestHint")}
        </p>
      </div>
    </div>
  );
}