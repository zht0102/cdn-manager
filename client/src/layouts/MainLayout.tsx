import React from 'react';
import { Layout, Menu } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  FileOutlined,
  DeleteOutlined,
  SettingOutlined
} from '@ant-design/icons';

const { Header, Content, Sider } = Layout;

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页'
    },
    {
      key: '/resources',
      icon: <FileOutlined />,
      label: '资源管理'
    },
    {
      key: '/trash',
      icon: <DeleteOutlined />,
      label: '回收站'
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '系统设置'
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ padding: 0, background: '#fff' }}>
        <div style={{ padding: '0 24px', fontSize: '18px', fontWeight: 'bold' }}>
          CDN 资源管理系统
        </div>
      </Header>
      <Layout>
        <Sider width={200} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
          />
        </Sider>
        <Layout style={{ padding: '24px' }}>
          <Content style={{ 
            background: '#fff', 
            padding: 24, 
            margin: 0, 
            minHeight: 280 
          }}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default MainLayout;