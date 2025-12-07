"use client";

import { useState, useEffect } from "react";
import { Settings, Loader2, Plus, Trash2, FolderOpen, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { DataSchema, Category, LinkItem } from "@/lib/types";
import { GithubConfig, GITHUB_CONFIG_KEY } from "@/lib/github";
import { useLocalStorage } from "@/lib/hooks";

interface SettingsDialogProps {
  data: DataSchema;
  onSave: (newData: DataSchema) => Promise<void>;
  isSaving: boolean;
}

// 常用网站图标映射表
const ICON_MAP: Record<string, string> = {
  "github": "Github", "google": "Search", "twitter": "Twitter", "x.com": "Twitter",
  "youtube": "Youtube", "instagram": "Instagram", "facebook": "Facebook", "vercel": "Triangle",
  "react": "Atom", "vue": "Codepen", "tailwind": "Wind", "shadcn": "Component",
  "next": "Cpu", "dribbble": "Dribbble", "unsplash": "Image", "figma": "Figma",
  "notion": "FileText", "chatgpt": "Bot", "openai": "Bot", "claude": "MessageSquare",
  "deepseek": "Brain", "bilibili": "Tv", "zhihu": "BookOpen", "mail": "Mail",
  "gmail": "Mail", "outlook": "Mail", "docs": "FileText", "sheet": "Table",
};

const IconRender = ({ name, className }: { name: string; className?: string }) => {
  // @ts-ignore
  const Icon = (Icons[name as keyof typeof Icons] as LucideIcon) || LinkIcon;
  return <Icon className={className} />;
};

export function SettingsDialog({ data, onSave, isSaving }: SettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [localData, setLocalData] = useState<DataSchema>(data);
  
  // 表单状态
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newIcon, setNewIcon] = useState("Link");

  // GitHub 配置
  const [ghConfig, setGhConfig] = useLocalStorage<GithubConfig>(GITHUB_CONFIG_KEY, {
    token: "", owner: "", repo: "", path: "public/data.json"
  });

  useEffect(() => {
    if (open) setLocalData(data);
  }, [open, data]);

  // 智能识别
  const handleUrlBlur = () => {
    if (!newUrl) return;
    let processedUrl = newUrl.startsWith("http") ? newUrl : `https://${newUrl}`;
    setNewUrl(processedUrl);

    if (!newTitle) {
      try {
        const hostname = new URL(processedUrl).hostname.replace("www.", "");
        const name = hostname.split(".")[0];
        setNewTitle(name.charAt(0).toUpperCase() + name.slice(1));
      } catch (e) {}
    }

    const lowerUrl = processedUrl.toLowerCase();
    for (const key in ICON_MAP) {
      if (lowerUrl.includes(key)) {
        setNewIcon(ICON_MAP[key]);
        break;
      }
    }
  };

  const handleAddLink = () => {
    if (!newUrl || !newTitle || !newCategory) {
      toast.error("请填写完整信息");
      return;
    }

    const newData = { ...localData };
    let categoryIndex = newData.categories.findIndex(c => c.title === newCategory);
    
    if (categoryIndex === -1) {
      newData.categories.push({
        id: `c-${Date.now()}`,
        title: newCategory,
        links: []
      });
      categoryIndex = newData.categories.length - 1;
    }

    newData.categories[categoryIndex].links.push({
      id: `l-${Date.now()}`,
      title: newTitle,
      url: newUrl,
      icon: newIcon
    });

    setLocalData(newData);
    setNewUrl(""); setNewTitle(""); setNewIcon("Link");
    toast.success("添加成功");
  };

  const handleDeleteLink = (catId: string, linkId: string) => {
    const newData = { ...localData };
    const catIndex = newData.categories.findIndex(c => c.id === catId);
    if (catIndex === -1) return;

    newData.categories[catIndex].links = newData.categories[catIndex].links.filter(l => l.id !== linkId);
    if (newData.categories[catIndex].links.length === 0) {
       newData.categories.splice(catIndex, 1);
    }
    setLocalData(newData);
  };

  const handleSave = async () => {
    const finalData = {
      ...localData,
      settings: {
        ...localData.settings,
        wallpaperList: localData.settings.wallpaperList || []
      }
    };
    await onSave(finalData);
    setOpen(false);
  };

  const existingCategories = Array.from(new Set(localData.categories.map(c => c.title)));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="fixed bottom-4 right-4 z-50 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md shadow-lg">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle>设置</DialogTitle>
          <DialogDescription>管理导航、外观及同步。</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="links" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3 shrink-0">
            <TabsTrigger value="links">链接管理</TabsTrigger>
            <TabsTrigger value="general">外观设置</TabsTrigger>
            <TabsTrigger value="github">云同步</TabsTrigger>
          </TabsList>

          <TabsContent value="links" className="flex-1 flex flex-col min-h-0 gap-4 py-4">
            <div className="grid gap-4 p-4 border rounded-xl bg-muted/30 shrink-0">
              <div className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-12 sm:col-span-6 space-y-1.5">
                  <Label className="text-xs">URL</Label>
                  <Input placeholder="example.com" value={newUrl} onChange={e => setNewUrl(e.target.value)} onBlur={handleUrlBlur} className="h-9" />
                </div>
                <div className="col-span-12 sm:col-span-6 space-y-1.5">
                  <Label className="text-xs">标题</Label>
                  <div className="relative">
                    <Input placeholder="标题" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="h-9 pl-9" />
                    <div className="absolute left-2.5 top-2 opacity-70"><IconRender name={newIcon} className="h-5 w-5" /></div>
                  </div>
                </div>
                <div className="col-span-8 sm:col-span-9 space-y-1.5">
                  <Label className="text-xs">分类</Label>
                  <Input list="cats" placeholder="选择或输入" value={newCategory} onChange={e => setNewCategory(e.target.value)} className="h-9" />
                  <datalist id="cats">{existingCategories.map(c => <option key={c} value={c} />)}</datalist>
                </div>
                <div className="col-span-4 sm:col-span-3">
                  <Button onClick={handleAddLink} className="w-full h-9"><Plus className="h-4 w-4 mr-1" /> 添加</Button>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 border rounded-xl bg-muted/10">
              <div className="space-y-6 p-4">
                {localData.categories.map((cat) => (
                  <div key={cat.id} className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
                      <FolderOpen className="h-3.5 w-3.5" /> {cat.title}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {cat.links.map((link) => (
                        <div key={link.id} className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/40 hover:border-border hover:shadow-sm transition-all group">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-1.5 rounded-md bg-muted/50 text-foreground/70 shrink-0">
                              <IconRender name={link.icon || "Link"} className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-medium truncate">{link.title}</span>
                              <span className="text-[10px] text-muted-foreground truncate opacity-70">{new URL(link.url).hostname}</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => handleDeleteLink(cat.id, link.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="general" className="space-y-6 py-4 overflow-y-auto">
            <div className="space-y-2">
              <Label>网站标题</Label>
              <Input value={localData.settings.title} onChange={e => setLocalData({...localData, settings: {...localData.settings, title: e.target.value}})} />
            </div>
            <div className="space-y-3 border border-border/50 p-4 rounded-xl bg-muted/30">
              <Label>壁纸模式</Label>
              <div className="flex gap-2">
                {(['url', 'local', 'bing'] as const).map(mode => (
                  <Button key={mode} variant={localData.settings.wallpaperType === mode ? "default" : "outline"} size="sm" onClick={() => setLocalData({...localData, settings: {...localData.settings, wallpaperType: mode}})} className="flex-1 capitalize">
                    {mode === 'url' ? 'URL' : mode === 'local' ? '本地' : 'Bing'}
                  </Button>
                ))}
              </div>
              {localData.settings.wallpaperType === 'url' && (
                <div className="space-y-2 animate-in fade-in"><Label>链接</Label><Input value={localData.settings.wallpaper} onChange={e => setLocalData({...localData, settings: {...localData.settings, wallpaper: e.target.value}})} /></div>
              )}
              {localData.settings.wallpaperType === 'local' && (
                <div className="space-y-2 animate-in fade-in"><Label>路径列表</Label><Textarea value={localData.settings.wallpaperList?.join('\n') || ''} onChange={e => setLocalData({...localData, settings: {...localData.settings, wallpaperList: e.target.value.split('\n').filter(l => l.trim())}})} placeholder="/wallpapers/1.jpg" className="h-24 font-mono text-xs" /></div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="github" className="space-y-4 py-4 overflow-y-auto">
            <div className="space-y-2"><Label>Token</Label><Input type="password" value={ghConfig.token} onChange={e => setGhConfig({...ghConfig, token: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Owner</Label><Input value={ghConfig.owner} onChange={e => setGhConfig({...ghConfig, owner: e.target.value})} /></div>
              <div className="space-y-2"><Label>Repo</Label><Input value={ghConfig.repo} onChange={e => setGhConfig({...ghConfig, repo: e.target.value})} /></div>
            </div>
            <div className="space-y-2"><Label>Path</Label><Input value={ghConfig.path} onChange={e => setGhConfig({...ghConfig, path: e.target.value})} /></div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={handleSave} disabled={isSaving}>{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}保存并更新</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}