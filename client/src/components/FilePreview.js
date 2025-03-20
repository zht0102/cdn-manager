import React, { useState } from 'react';
import { Card, Empty, Spin } from 'antd';
import { Document, Page, pdfjs } from 'react-pdf';
import SyntaxHighlighter from 'react-syntax-highlighter';
import ReactPlayer from 'react-player';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';

// 设置 PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const FilePreview = ({ file }) => {
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  const getPreviewComponent = () => {
    const fileType = file.mimeType.split('/')[0];
    const fileExtension = file.originalName.split('.').pop().toLowerCase();

    switch (fileType) {
      case 'image':
        return (
          <>
            <img
              src={`/uploads/${file.filename}`}
              alt={file.originalName}
              style={{ maxWidth: '100%', cursor: 'pointer' }}
              onClick={() => setLightboxOpen(true)}
              onLoad={() => setLoading(false)}
            />
            {lightboxOpen && (
              <Lightbox
                mainSrc={`/uploads/${file.filename}`}
                onCloseRequest={() => setLightboxOpen(false)}
              />
            )}
          </>
        );

      case 'application':
        if (fileExtension === 'pdf') {
          return (
            <Document
              file={`/uploads/${file.filename}`}
              onLoadSuccess={({ numPages }) => {
                setNumPages(numPages);
                setLoading(false);
              }}
              onLoadError={() => setLoading(false)}
            >
              <Page pageNumber={pageNumber} />
              <div style={{ textAlign: 'center', marginTop: 10 }}>
                <span>
                  第 {pageNumber} 页，共 {numPages} 页
                </span>
              </div>
            </Document>
          );
        }
        return <CodePreview file={file} onLoad={() => setLoading(false)} />;

      case 'video':
        return (
          <ReactPlayer
            url={`/uploads/${file.filename}`}
            controls
            width="100%"
            height="auto"
            onReady={() => setLoading(false)}
          />
        );

      case 'audio':
        return (
          <ReactPlayer
            url={`/uploads/${file.filename}`}
            controls
            width="100%"
            height="50px"
            onReady={() => setLoading(false)}
          />
        );

      case 'text':
        return <CodePreview file={file} onLoad={() => setLoading(false)} />;

      default:
        setLoading(false);
        return <Empty description="暂不支持该文件类型的预览" />;
    }
  };

  return (
    <Card>
      {loading && <Spin />}
      {getPreviewComponent()}
    </Card>
  );
};

// 代码预览组件
const CodePreview = ({ file, onLoad }) => {
  const [content, setContent] = useState('');

  React.useEffect(() => {
    fetch(`/uploads/${file.filename}`)
      .then(response => response.text())
      .then(text => {
        setContent(text);
        onLoad();
      })
      .catch(() => onLoad());
  }, [file]);

  return (
    <SyntaxHighlighter language={getLanguageFromFilename(file.originalName)}>
      {content}
    </SyntaxHighlighter>
  );
};

// 根据文件名获取编程语言
const getLanguageFromFilename = (filename) => {
  const extension = filename.split('.').pop().toLowerCase();
  const languageMap = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    java: 'java',
    cpp: 'cpp',
    cs: 'csharp',
    html: 'html',
    css: 'css',
    json: 'json',
    md: 'markdown',
    // 添加更多语言映射
  };
  return languageMap[extension] || 'text';
};

export default FilePreview; 