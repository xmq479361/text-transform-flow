import { ConfigProvider, theme } from "antd";
import Layout from "./components/Layout";
import { useState, useEffect } from "react";

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("isDarkMode");
    return savedMode ? JSON.parse(savedMode) : true;
  });

  useEffect(() => {
    localStorage.setItem("isDarkMode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          // colorPrimary: isDarkMode ? "#1668dc" : "#ff0000",
          colorPrimary: "#1668dc", // 主色调
          // colorBgBase: isDarkMode ? "#141414" : "#ffffff", // 基础背景色
          // colorText: isDarkMode ? "#ffffff" : "#000000", // 文本颜色
          borderRadius: 4, // 圆角
        },
        components: {
          // Collapse: {
          //   collapseContentBg: isDarkMode ? "#0d6efd" : "#f0f2f5", // 内容背景色
          //   collapseHeaderBg: isDarkMode ? "#0d47a1" : "#e6f7ff", // Header 背景色
          //   collapseHeaderPadding: 12, // Header 内边距
          //   collapseHeaderPaddingSM: 10, // Header 小屏内边距
          //   collapseHeaderPaddingLG: 14, // Header 大屏内边距
          //   collapsePanelBorderRadius: 8, // Panel 圆角
          //   collapseContentPaddingHorizontal: 16, // 内容水平内边距
          // },
          //   Collapse: {
          //     collapseContentBg: isDarkMode ? "#0d6efd" : "#1668dc", // 按钮主色
          //     collapseHeaderBg: isDarkMode ? "#0d6efd" : "#1668dc", // 按钮主色
          //     collapseHeaderPadding: 8, // 按钮圆角
          //     collapseHeaderPaddingSM: 8, // 按钮圆角
          //     collapseHeaderPaddingLG: 8, // 按钮圆角
          //     collapsePanelBorderRadius: 8, // 按钮圆角
          //     collapseContentPaddingHorizontal: 8, // 按钮圆角
          //   },
          //   Button: {
          //     colorPrimary: isDarkMode ? "#0d6efd" : "#1668dc", // 按钮主色
          //     borderRadius: 8, // 按钮圆角
          //   },
          //   Menu: {
          //     colorItemBg: isDarkMode ? "#1f1f1f" : "#ffffff", // 菜单背景色
          //     colorItemText: isDarkMode ? "#ffffff" : "#000000", // 菜单文本色
          //   },
        },
      }}
    >
        <Layout isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
    </ConfigProvider>
  );
}
