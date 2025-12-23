import React from 'react';
import { FileText, Download, ExternalLink, Upload } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import { formatDate, formatRelativeTime } from '@/utils/helpers';

const DocumentList = ({ projectId }) => {
  // Mock documents
  const documents = [
    {
      id: 1,
      title: 'Game Design Document',
      type: 'PDF',
      size: '2.4 MB',
      uploadedBy: 'Sarah Chen',
      uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      url: '#',
    },
    {
      id: 2,
      title: 'Technical Specification',
      type: 'PDF',
      size: '1.8 MB',
      uploadedBy: 'Marcus Johnson',
      uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      url: '#',
    },
    {
      id: 3,
      title: 'Art Style Guide',
      type: 'PDF',
      size: '5.2 MB',
      uploadedBy: 'Emily Watson',
      uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      url: '#',
    },
  ];
  
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="primary" icon={Upload}>
          Upload Document
        </Button>
      </div>
      
      <div className="space-y-3">
        {documents.map((doc) => (
          <Card key={doc.id} padding="md">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 truncate">{doc.title}</h4>
                <p className="text-sm text-gray-600">
                  {doc.type} • {doc.size} • Uploaded by {doc.uploadedBy} • {formatRelativeTime(doc.uploadedAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-600 hover:text-gray-900 transition">
                  <Download className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-900 transition">
                  <ExternalLink className="w-5 h-5" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DocumentList;