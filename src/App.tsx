import { ConfigProvider, theme } from 'antd'
import Layout from './components/Layout'

export default function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#1668dc',
        },
      }}
    >
      <Layout />
    </ConfigProvider>
  )
}

