"use client";

import { useEffect, useState } from "react";
import { ClockWidget } from "@/components/nav/clock";
import { WeatherWidget } from "@/components/nav/weather";
import { SearchBar } from "@/components/nav/search-bar";
import { LinkGrid } from "@/components/nav/link-grid";
import { SettingsDialog } from "@/components/nav/settings-dialog";
import { DataSchema, DEFAULT_DATA, Category } from "@/lib/types";
import { loadDataFromGithub, saveDataToGithub, GITHUB_CONFIG_KEY, GithubConfig } from "@/lib/github";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [data, setData] = useState<DataSchema>(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // 新增：专注模式状态，当文件夹打开时为 true
  const [isFocusMode, setIsFocusMode] = useState(false);

  useEffect(() => {
    async function initData() {
      try {
        const storedConfig = localStorage.getItem(GITHUB_CONFIG_KEY);
        if (storedConfig) {
          const config: GithubConfig = JSON.parse(storedConfig);
          if (config.token) {
            const ghData = await loadDataFromGithub(config);
            if (ghData) {
              setData(ghData);
              setLoading(false);
              return;
            }
          }
        }
        try {
          const res = await fetch("/data.json");
          if (res.ok) {
            const jsonData = await res.json();
            setData(jsonData);
          }
        } catch (e) {
          console.log("No local data.json found, using default.");
        }
      } catch (err) {
        console.error("Initialization error", err);
      } finally {
        setLoading(false);
      }
    }
    initData();
  }, []);

  const handleSave = async (newData: DataSchema) => {
    setSaving(true);
    try {
      setData(newData);
      const storedConfig = localStorage.getItem(GITHUB_CONFIG_KEY);
      if (!storedConfig) {
        toast.success("本地状态已更新 (未同步 GitHub)");
        setSaving(false);
        return;
      }
      const config: GithubConfig = JSON.parse(storedConfig);
      if (!config.token) {
        setSaving(false);
        return;
      }
      const success = await saveDataToGithub(config, newData);
      if (success) {
        toast.success("同步成功！");
      } else {
        toast.error("同步失败");
      }
    } catch (error) {
      console.error(error);
      toast.error("保存时发生错误");
    } finally {
      setSaving(false);
    }
  };

  const handleReorder = (newCategories: Category[]) => {
    const newData = { ...data, categories: newCategories };
    handleSave(newData);
  };

  const bgStyle = {
    backgroundImage: `url(${data.settings.wallpaper})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  return (
    <main 
      className="relative min-h-screen w-full overflow-hidden flex flex-col items-center p-6 md:p-12 transition-all duration-700"
      style={bgStyle}
    >
      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center mt-10 md:mt-20">
          
          {/* 性能优化核心：
             将时钟、天气、搜索栏包裹在一个容器中。
             当 isFocusMode 为 true (文件夹打开) 时，这些元素会被设为透明并移除点击事件。
             这减少了浏览器在渲染毛玻璃模态框时的背景绘制工作量。
          */}
          <div className={`flex flex-col items-center w-full transition-all duration-500 ease-in-out ${
            isFocusMode ? 'opacity-0 blur-md scale-95 pointer-events-none' : 'opacity-100 scale-100'
          }`}>
            <ClockWidget />
            <WeatherWidget />
            <div className="h-8" />
            <SearchBar />
          </div>
          
          <LinkGrid 
            categories={data.categories} 
            onReorder={handleReorder}
            onOpenChange={setIsFocusMode} // 传递状态控制器
          />
          
      </div>

      {/* 设置按钮在打开文件夹时也隐藏 */}
      <div className={`transition-opacity duration-300 ${isFocusMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <SettingsDialog 
          data={data} 
          onSave={handleSave} 
          isSaving={saving}
        />
      </div>
      
      <Toaster position="top-center" />
    </main>
  );
}