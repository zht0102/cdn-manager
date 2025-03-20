import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { FileOutlined, CloudUploadOutlined, EyeOutlined } from '@ant-design/icons';

const Home: React.FC = () => {
  return (
    <div>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="总资源数"
              value={123}
              prefix={<FileOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="今日上传"
              value={12}
              prefix={<CloudUploadOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="总访问量"
              value={1234}
              prefix={<EyeOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home; 