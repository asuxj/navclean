import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. 开启静态导出：生成纯 HTML/CSS/JS 静态文件
  output: "export",
  
  // 2. 关闭图片优化：静态导出模式不支持默认的 Image Optimization API
  images: {
    unoptimized: true,
  },

  // 3. 保持之前的 React 编译器配置
  reactCompiler: true,
};

export default nextConfig;