import React, { useRef } from 'react';
import {Card} from 'antd';
import ResourceList from '@/components/ResourceList';
import DragUpload from '@/components/DragUpload';

const Resources: React.FC = () => {
    const resourceListRef = useRef<{ refresh: () => void }>(null);

    const reFresh = () => {
        resourceListRef.current?.refresh();
    }

    return (
        <div>
            <DragUpload onUploadSuccess={reFresh}/>
            <Card style={{marginTop: 16}}>
                <ResourceList ref={resourceListRef}/>
            </Card>
        </div>
    );
};

export default Resources;
