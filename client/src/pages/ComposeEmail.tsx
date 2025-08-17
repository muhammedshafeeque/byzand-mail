import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { emailAPI } from '../services/api';
import {
  XMarkIcon,
  PaperClipIcon,
  TrashIcon,
  ArrowUturnLeftIcon
} from '@heroicons/react/24/outline';

const ComposeEmail: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: ''
  });
  
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);

  const replyTo = searchParams.get('reply');
  const forwardFrom = searchParams.get('forward');

  useEffect(() => {
    if (replyTo || forwardFrom) {
      fetchOriginalEmail();
    }
  }, [replyTo, forwardFrom]);

  const fetchOriginalEmail = async () => {
    try {
      const emailId = replyTo || forwardFrom;
      if (!emailId) return;

      const response = await emailAPI.getEmail(emailId);
      const email = response.data.data.email;
      // setOriginalEmail(email); // This line was removed

      if (replyTo) {
        // Reply mode
        setFormData({
          to: email.from,
          cc: '',
          bcc: '',
          subject: `Re: ${email.subject}`,
          body: `\n\nOn ${new Date(email.receivedAt).toLocaleString()}, ${email.from} wrote:\n> ${email.text || email.html?.replace(/<[^>]*>/g, '') || ''}`
        });
      } else if (forwardFrom) {
        // Forward mode
        setFormData({
          to: '',
          cc: '',
          bcc: '',
          subject: `Fwd: ${email.subject}`,
          body: `\n\n---------- Forwarded message ----------\nFrom: ${email.from}\nDate: ${new Date(email.receivedAt).toLocaleString()}\nSubject: ${email.subject}\n\n${email.text || email.html?.replace(/<[^>]*>/g, '') || ''}`
        });
      }
    } catch (error) {
      console.error('Failed to fetch original email:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.to.trim() || !formData.subject.trim()) {
      alert('Please fill in the required fields (To and Subject)');
      return;
    }

    setLoading(true);
    
    try {
      const emailData = {
        to: formData.to,
        cc: formData.cc,
        bcc: formData.bcc,
        subject: formData.subject,
        text: formData.body
      };

      await emailAPI.sendEmail(emailData, attachments);
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Failed to send email:', error);
      alert(error.response?.data?.error || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    // TODO: Implement save draft functionality
    console.log('Save draft:', formData);
  };

  const handleDiscard = () => {
    if (window.confirm('Are you sure you want to discard this email?')) {
      navigate('/dashboard');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Compose Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDiscard}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-medium text-gray-900">
              {replyTo ? 'Reply' : forwardFrom ? 'Forward' : 'New Message'}
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSaveDraft}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Save draft
            </button>
            <button
              onClick={handleDiscard}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Discard
            </button>
          </div>
        </div>
      </div>

      {/* Compose Form */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {/* Email Fields */}
          <div className="space-y-0">
            {/* To Field */}
            <div className="flex items-center border-b border-gray-200 px-4 py-3">
              <label className="w-16 text-sm font-medium text-gray-700">To:</label>
              <input
                type="email"
                value={formData.to}
                onChange={(e) => handleInputChange('to', e.target.value)}
                className="flex-1 border-none outline-none text-sm"
                placeholder="Recipients"
                required
              />
            </div>

            {/* CC Field */}
            {showCc && (
              <div className="flex items-center border-b border-gray-200 px-4 py-3">
                <label className="w-16 text-sm font-medium text-gray-700">Cc:</label>
                <input
                  type="email"
                  value={formData.cc}
                  onChange={(e) => handleInputChange('cc', e.target.value)}
                  className="flex-1 border-none outline-none text-sm"
                  placeholder="Cc recipients"
                />
              </div>
            )}

            {/* BCC Field */}
            {showBcc && (
              <div className="flex items-center border-b border-gray-200 px-4 py-3">
                <label className="w-16 text-sm font-medium text-gray-700">Bcc:</label>
                <input
                  type="email"
                  value={formData.bcc}
                  onChange={(e) => handleInputChange('bcc', e.target.value)}
                  className="flex-1 border-none outline-none text-sm"
                  placeholder="Bcc recipients"
                />
              </div>
            )}

            {/* Subject Field */}
            <div className="flex items-center border-b border-gray-200 px-4 py-3">
              <label className="w-16 text-sm font-medium text-gray-700">Subject:</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                className="flex-1 border-none outline-none text-sm"
                placeholder="Subject"
                required
              />
            </div>
          </div>

          {/* Email Body */}
          <div className="flex-1 px-4 py-4">
            <textarea
              value={formData.body}
              onChange={(e) => handleInputChange('body', e.target.value)}
              className="w-full h-full border-none outline-none resize-none text-sm"
              placeholder="Write your message here..."
            />
          </div>

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Attachments</h3>
              <div className="space-y-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <PaperClipIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{file.name}</span>
                      <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Compose Footer */}
        <div className="border-t border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <ArrowUturnLeftIcon className="h-4 w-4" />
                    <span>Send</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => setShowCc(!showCc)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Cc
              </button>
              <button
                type="button"
                onClick={() => setShowBcc(!showBcc)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Bcc
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                <PaperClipIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ComposeEmail;
