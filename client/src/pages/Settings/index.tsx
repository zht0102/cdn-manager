import React from 'react';
import { Card, Form, Input, Button, Switch, InputNumber } from 'antd';

const Settings: React.FC = () => {
  return (
    <Card title="系统设置">
      <Form layout="vertical">
        <Form.Item label="上传文件大小限制" name="maxFileSize">
          <InputNumber addonAfter="MB" min={1} max={1000} />
        </Form.Item>
        <Form.Item label="允许的文件类型" name="allowedTypes">
          <Input placeholder="例如: .jpg,.png,.pdf" />
        </Form.Item>
        <Form.Item label="启用访问统计" name="enableStats">
          <Switch />
        </Form.Item>
        <Form.Item>
          <Button type="primary">保存设置</Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default Settings; 