import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { emailAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  StarIcon,
  EnvelopeIcon,
  EnvelopeOpenIcon,
  PaperClipIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';

// Temporary Email type definition
interface Email {
  _id: string;
  messageId: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    contentType: string;
    size: number;
    path: string;
  }>;
  isRead: boolean;
  isStarred: boolean;
  isSpam: boolean;
  isTrash: boolean;
  labels: string[];
  folder: string;
  receivedAt: string;
  sentAt?: string;
  userId: string;
}

const Dashboard: React.FC = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [searchParams] = useSearchParams();

  const folder = searchParams.get('folder') || 'inbox';
  const search = searchParams.get('search') || '';

  useEffect(() => {
    fetchEmails();
  }, [folder, search]);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const params: any = { folder };
      if (search) params.search = search;
      
      const response = await emailAPI.getEmails(params);
      setEmails(response.data.data.emails || []);
    } catch (error) {
      console.error('Failed to fetch emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEmail = (emailId: string) => {
    setSelectedEmails(prev => 
      prev.includes(emailId) 
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId]
    );
  };

  const handleBulkAction = async (action: string) => {
    if (selectedEmails.length === 0) return;

    try {
      switch (action) {
        case 'delete':
          await emailAPI.bulkUpdateEmails(selectedEmails, { folder: 'trash' });
          break;
        case 'archive':
          await emailAPI.bulkUpdateEmails(selectedEmails, { folder: 'archive' });
          break;
        case 'markRead':
          await emailAPI.bulkUpdateEmails(selectedEmails, { isRead: true });
          break;
        case 'markUnread':
          await emailAPI.bulkUpdateEmails(selectedEmails, { isRead: false });
          break;
      }
      fetchEmails();
      setSelectedEmails([]);
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getFolderTitle = () => {
    switch (folder) {
      case 'inbox': return 'Inbox';
      case 'sent': return 'Sent';
      case 'drafts': return 'Drafts';
      case 'trash': return 'Trash';
      case 'spam': return 'Spam';
      case 'archive': return 'Archive';
      case 'starred': return 'Starred';
      default: return 'Inbox';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Toolbar */}
      {selectedEmails.length > 0 && (
        <div className="bg-blue-50 border-b border-gray-200 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {selectedEmails.length} selected
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBulkAction('markRead')}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Mark as read
                </button>
                <button
                  onClick={() => handleBulkAction('markUnread')}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Mark as unread
                </button>
                <button
                  onClick={() => handleBulkAction('archive')}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Archive
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedEmails([]);
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Clear selection
            </button>
          </div>
        </div>
      )}

      {/* Email List */}
      <div className="flex-1 overflow-y-auto">
        {emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <EnvelopeIcon className="h-16 w-16 mb-4" />
            <p className="text-lg font-medium">No emails in {getFolderTitle()}</p>
            <p className="text-sm">When you receive emails, they'll appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {emails.map((email) => (
              <div
                key={email._id}
                className={`flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                  !email.isRead ? 'bg-blue-50' : ''
                } ${selectedEmails.includes(email._id) ? 'bg-blue-100' : ''}`}
                onClick={() => handleSelectEmail(email._id)}
              >
                {/* Checkbox */}
                <div className="flex items-center mr-3" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedEmails.includes(email._id)}
                    onChange={() => handleSelectEmail(email._id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>

                {/* Star */}
                <button
                  className="mr-3 text-gray-400 hover:text-yellow-400"
                  onClick={(e) => e.stopPropagation()}
                >
                  <StarIcon className={`h-5 w-5 ${email.isStarred ? 'text-yellow-400 fill-current' : ''}`} />
                </button>

                {/* Read/Unread Icon */}
                <div className="mr-3">
                  {email.isRead ? (
                    <EnvelopeOpenIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EnvelopeIcon className="h-5 w-5 text-gray-600" />
                  )}
                </div>

                {/* Email Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium truncate ${
                          !email.isRead ? 'text-gray-900' : 'text-gray-600'
                        }`}>
                          {email.from}
                        </span>
                        {email.attachments && email.attachments.length > 0 && (
                          <PaperClipIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className={`text-sm truncate ${
                        !email.isRead ? 'font-medium text-gray-900' : 'text-gray-600'
                      }`}>
                        {email.subject}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {email.text || email.html?.replace(/<[^>]*>/g, '') || 'No preview available'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <span className="text-xs text-gray-500">
                        {formatDate(email.receivedAt)}
                      </span>
                      <button
                        className="text-gray-400 hover:text-gray-600"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <EllipsisVerticalIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {emails.length > 0 && (
        <div className="border-t border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {emails.length} emails
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
