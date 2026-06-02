import { useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function KnowledgeHub() {
  const { t } = useLocale();
  const { articles, setArticles } = useAuth();
  const [isPremiumUnlocked, setIsPremiumUnlocked] = useState(false);
  const [openArticleId, setOpenArticleId] = useState<string | null>(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});

  const handleAddComment = (articleId: string) => {
    const draft = commentDrafts[articleId]?.trim();
    if (!draft) return;

    setArticles((current) =>
      current.map((article) =>
        article.id === articleId
          ? { ...article, comments: [...(article.comments || []), draft] }
          : article
      )
    );
    setCommentDrafts((current) => ({ ...current, [articleId]: "" }));
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-16 space-y-4">
        <h1 className="text-3xl md:text-4xl font-serif text-foreground tracking-tight">{t("knowledge.title")}</h1>
        <p className="text-muted-foreground font-light max-w-2xl">
          {t("knowledge.subtitle")}
        </p>
      </div>

      {!isPremiumUnlocked ? (
        <Card className="mb-12 bg-gradient-to-r from-[#4A5D4E]/10 to-[#4A5D4E]/5 border-none shadow-sm">
          <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-xl font-medium tracking-tight text-[#4A5D4E]">{t("knowledge.upgradeBanner")}</h3>
              <p className="text-muted-foreground text-sm max-w-xl">
                {t("knowledge.upgradeDesc")}
              </p>
            </div>
            <Button 
              onClick={() => setIsPremiumUnlocked(true)}
              className="bg-[#4A5D4E] hover:bg-[#3A4A3E] text-white shrink-0"
            >
              {t("knowledge.upgradeBtn")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="mb-12 p-4 bg-green-50 border border-green-100 rounded-lg flex items-center gap-3 text-green-800 text-sm">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <div>
            <p className="font-medium">{t("knowledge.unlocked")}</p>
            <p className="text-green-700/80">{t("knowledge.unlockedDesc")}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {articles.map((article) => {
          const isOpen = openArticleId === article.id;

          return (
            <Card key={article.id} className="border-border/50 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
              <div className="h-48 w-full bg-gradient-to-br from-[#4A5D4E]/15 to-[#F4F5F0] overflow-hidden">
                {article.imageUrl ? (
                  <img src={article.imageUrl} alt={article.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">{t("knowledge.roomFallback")}</div>
                )}
              </div>
              <CardContent className="p-6 flex-grow flex flex-col space-y-4 relative z-10 bg-card">
                <div>
                  <Badge variant="outline" className="text-xs font-medium text-muted-foreground border-border/60 rounded-sm mb-3">
                    {article.category}
                  </Badge>
                  
                  <h3 className="text-xl font-medium tracking-tight mb-2 group-hover:text-primary transition-colors">{article.title}</h3>
                  
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {isOpen ? article.content : `${article.content.slice(0, 140)}${article.content.length > 140 ? "..." : ""}`}
                  </p>
                </div>

                {isOpen && (
                  <div className="space-y-4 rounded-lg border border-border/60 bg-muted/20 p-4">
                    <div>
                      <h4 className="mb-2 text-sm font-medium">{t("knowledge.commentsTitle")}</h4>
                      {(article.comments || []).length === 0 ? (
                        <p className="text-xs text-muted-foreground">{t("knowledge.noResponses")}</p>
                      ) : (
                        <div className="space-y-2">
                          {(article.comments || []).map((comment, index) => (
                            <div key={`${article.id}-comment-${index}`} className="rounded-md bg-background px-3 py-2 text-sm text-muted-foreground">
                              {comment}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Textarea
                        value={commentDrafts[article.id] || ""}
                        onChange={(event) => setCommentDrafts((current) => ({ ...current, [article.id]: event.target.value }))}
                        placeholder={t("knowledge.responsePlaceholder")}
                        className="min-h-20 bg-background text-sm"
                      />
                      <Button size="sm" className="rounded-sm bg-[#4A5D4E] hover:bg-[#3A4A3E]" onClick={() => handleAddComment(article.id)}>
                        {t("knowledge.addResponse")}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="pt-4 mt-auto">
                  <Button
                    variant="link"
                    className="px-0 h-auto font-medium text-foreground hover:no-underline hover:text-primary p-0"
                    onClick={() => setOpenArticleId(isOpen ? null : article.id)}
                  >
                    {isOpen ? t("knowledge.closeArticle") : `${t("knowledge.readArticle")} →`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
