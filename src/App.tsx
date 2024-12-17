import { ConfigProvider, theme } from "antd";
import Layout from "./components/Layout";
import { useState, useEffect } from "react";
import { ProcessingFlow } from "./types";

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("isDarkMode");
    return savedMode ? JSON.parse(savedMode) : true;
  });

  const [flows, setFlows] = useState<ProcessingFlow[]>(() => {
    const savedFlows = localStorage.getItem("flows");
    return savedFlows ? JSON.parse(savedFlows) : [];
  });

  useEffect(() => {
    localStorage.setItem("isDarkMode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem("flows", JSON.stringify(flows));
  }, [flows]);

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
      <Layout
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        flows={flows}
        onFlowsChange={setFlows}
      />
    </ConfigProvider>
  );
}
