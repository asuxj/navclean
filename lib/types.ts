export interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon?: string;
  description?: string;
}

export interface Category {
  id: string;
  title: string;
  links: LinkItem[];
}

export interface SiteSettings {
  title: string;
  wallpaper: string; // 当 type 为 'url' 或 'api' 时使用的地址
  wallpaperType: 'url' | 'local' | 'bing'; // 增加 'local' 类型
  wallpaperList: string[]; // 新增：本地壁纸列表
  blurLevel: 'low' | 'medium' | 'high';
}

export interface DataSchema {
  settings: SiteSettings;
  categories: Category[];
}

export const DEFAULT_DATA: DataSchema = {
  settings: {
    title: "Clean Nav",
    wallpaper: "https://images.unsplash.com/photo-1477346611705-65d1883cee1e?auto=format&fit=crop&q=80&w=1920",
    wallpaperType: 'url',
    wallpaperList: [], // 默认为空
    blurLevel: 'medium'
  },
  categories: [
    {
      id: "c1",
      title: "常用",
      links: [
        { id: "l1", title: "Google", url: "https://google.com", icon: "Search" },
        { id: "l2", title: "GitHub", url: "https://github.com", icon: "Github" },
      ]
    }
  ]
};