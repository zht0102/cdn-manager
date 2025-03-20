import React from 'react';
import { Card, Tabs } from 'antd';
import ResourceStats from '../components/ResourceStats';

const { TabPane } = Tabs;

const ResourceDetail = ({ resourceId }) => {
  return (
    <Card>
      <Tabs defaultActiveKey="stats">
        <TabPane tab="基本信息" key="info">
          {/* 资源基本信息展示 */}
        </TabPane>
        <TabPane tab="访问统计" key="stats">
          <ResourceStats resourceId={resourceId} />
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default ResourceDetail; 