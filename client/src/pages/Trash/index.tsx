import React from 'react';
import { Card } from 'antd';
import TrashList from '@/components/TrashList';

const Trash: React.FC = () => {
  return (
    <Card title="回收站">
      <TrashList />
    </Card>
  );
};

export default Trash; 