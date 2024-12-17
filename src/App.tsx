import { ConfigProvider, theme } from "antd";
import Layout from "./components/Layout";
import { useState, useEffect } from "react";
import FlowManager from "./components/FlowManager";
import { ProcessingFlow } from "./types";

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("isDarkMode");
    return savedMode ? JSON.parse(savedMode) : true;
  });
  const [flows, setFlows] = useState<ProcessingFlow[]>([]);

  useEffect(() => {
    localStorage.setItem("isDarkMode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem("isDarkMode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: "#1668dc", // 主色调
          borderRadius: 4, // 圆角
          fontSize: 12,
        },
      }}
    >
      {/* <FlowManager onFlowsChange={setFlows} /> */}
      <Layout isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
    </ConfigProvider>
  );
}
