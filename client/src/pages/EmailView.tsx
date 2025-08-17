import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { emailAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  TrashIcon,
  ArchiveBoxIcon,
  StarIcon,
  PaperClipIcon,
  ClockIcon,
  UserIcon
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

const EmailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [email, setEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchEmail();
    }
  }, [id]);

  const fetchEmail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await emailAPI.getEmail(id!);
      setEmail(response.data.data.email);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to fetch email');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAction = async (action: string, value?: any) => {
    if (!email) return;

    try {
      switch (action) {
        case 'star':
          await emailAPI.updateEmail(email._id, { isStarred: value });
          setEmail(prev => prev ? { ...prev, isStarred: value } : null);
          break;
        case 'delete':
          await emailAPI.deleteEmail(email._id);
          navigate('/dashboard');
          break;
        case 'archive':
          await emailAPI.updateEmail(email._id, { folder: 'archive' });
          navigate('/dashboard');
          break;
        case 'spam':
          await emailAPI.markAsSpam(email._id, value);
          setEmail(prev => prev ? { ...prev, isSpam: value } : null);
          break;
      }
    } catch (error: any) {
      console.error('Email action failed:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString([], {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !email) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2">Email not found</h2>
          <p className="text-sm mb-4">{error || 'The email you are looking for does not exist.'}</p>
          <Link
            to="/dashboard"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Back to Inbox
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Email Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
            >
              <ArrowUturnLeftIcon className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">{email.subject}</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleEmailAction('star', !email.isStarred)}
              className="p-2 text-gray-400 hover:text-yellow-400 rounded-full"
            >
              <StarIcon className={`h-5 w-5 ${email.isStarred ? 'text-yellow-400 fill-current' : ''}`} />
            </button>
            <button
              onClick={() => handleEmailAction('archive')}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full"
            >
              <ArchiveBoxIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleEmailAction('delete')}
              className="p-2 text-gray-400 hover:text-red-600 rounded-full"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Email Meta */}
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <UserIcon className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{email.from}</p>
                  <p className="text-sm text-gray-500">to me</p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <ClockIcon className="h-4 w-4" />
                  <span>{formatDate(email.receivedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-4xl">
          {/* Attachments */}
          {email.attachments && email.attachments.length > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Attachments</h3>
              <div className="space-y-2">
                {email.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 bg-white rounded border">
                    <PaperClipIcon className="h-4 w-4 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {attachment.filename}
                      </p>
                      <p className="text-xs text-gray-500">
                        {attachment.contentType} • {formatFileSize(attachment.size)}
                      </p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Email Body */}
          <div className="prose max-w-none">
            {email.html ? (
              <div 
                dangerouslySetInnerHTML={{ __html: email.html }}
                className="text-gray-900 leading-relaxed"
              />
            ) : (
              <div className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                {email.text || 'No content available'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Email Actions */}
      <div className="border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              to={`/compose?reply=${email._id}`}
              className="btn-primary flex items-center space-x-2"
            >
              <ArrowUturnLeftIcon className="h-4 w-4" />
              <span>Reply</span>
            </Link>
            <Link
              to={`/compose?forward=${email._id}`}
              className="btn-secondary flex items-center space-x-2"
            >
              <ArrowUturnRightIcon className="h-4 w-4" />
              <span>Forward</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-2">
            {email.isSpam && (
              <button
                onClick={() => handleEmailAction('spam', false)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Not spam
              </button>
            )}
            <button
              onClick={() => handleEmailAction('spam', !email.isSpam)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              {email.isSpam ? 'Not spam' : 'Mark as spam'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailView;
