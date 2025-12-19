'use client';

import { useState, useTransition } from 'react';
import {
  Plus, Search, Send, MessageSquare, Phone, User,
  CheckCircle, Clock, XCircle, AlertTriangle, X,
  ChevronRight, FileText, Users
} from 'lucide-react';
import { sendMessage, sendBulkMessages } from './actions';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  temperature: string;
}

interface Message {
  id: string;
  type: string;
  direction: string;
  content: string;
  recipientPhone: string | null;
  recipientName: string | null;
  status: string;
  errorMessage: string | null;
  sentAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  contact: Contact | null;
}

interface Conversation {
  id: string;
  contact: Contact | null;
  recipientPhone: string | null;
  recipientName: string | null;
  lastMessage: Message;
  messageCount: number;
}

interface Script {
  id: string;
  title: string;
  content: string;
}

interface Stats {
  totalSent: number;
  totalReceived: number;
  delivered: number;
  failed: number;
}

interface MessagesClientProps {
  messages: Message[];
  conversations: Conversation[];
  contacts: Contact[];
  scripts: Script[];
  stats: Stats;
  smsEnabled: boolean;
}

const temperatureColors: Record<string, string> = {
  COLD: 'bg-blue-100 text-blue-700',
  WARMING: 'bg-yellow-100 text-yellow-700',
  WARM: 'bg-orange-100 text-orange-700',
  HOT: 'bg-red-100 text-red-700',
  CONVERTED: 'bg-green-100 text-green-700',
};

const statusIcons: Record<string, React.ReactNode> = {
  PENDING: <Clock className="w-3 h-3 text-yellow-500" />,
  SENT: <CheckCircle className="w-3 h-3 text-blue-500" />,
  DELIVERED: <CheckCircle className="w-3 h-3 text-green-500" />,
  FAILED: <XCircle className="w-3 h-3 text-red-500" />,
  READ: <CheckCircle className="w-3 h-3 text-green-600" />,
};

export default function MessagesClient({
  messages,
  conversations,
  contacts,
  scripts,
  stats,
  smsEnabled,
}: MessagesClientProps) {
  const [isPending, startTransition] = useTransition();
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [recipientPhone, setRecipientPhone] = useState('');

  // Filter conversations
  const filteredConversations = conversations.filter(conv => {
    const name = conv.contact
      ? `${conv.contact.firstName} ${conv.contact.lastName}`
      : conv.recipientName || conv.recipientPhone || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await sendMessage(formData);
      if (result.success) {
        setShowComposeModal(false);
        setMessageContent('');
        setSelectedContact(null);
        setRecipientPhone('');
      } else {
        alert(result.error || 'Failed to send message');
      }
    });
  };

  const handleBulkSend = async () => {
    if (selectedContacts.size === 0 || !messageContent) return;

    startTransition(async () => {
      const result = await sendBulkMessages(Array.from(selectedContacts), messageContent);
      if (result.success) {
        setShowBulkModal(false);
        setMessageContent('');
        setSelectedContacts(new Set());
        alert(`Sent: ${result.data?.sent}, Failed: ${result.data?.failed}`);
      } else {
        alert(result.error || 'Failed to send bulk messages');
      }
    });
  };

  const handleTemplateSelect = (script: Script) => {
    setMessageContent(script.content);
  };

  const toggleContactSelection = (contactId: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContacts(newSelected);
  };

  if (!smsEnabled) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">Send SMS and messages to your contacts</p>
        </div>

        <div className="card-gradient text-center py-12">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">SMS Not Enabled</h3>
          <p className="text-gray-600 mb-4">
            SMS messaging is not enabled for your organization.
            Upgrade your plan to unlock this feature.
          </p>
          <button className="btn-primary">Upgrade Plan</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Messages</h1>
        <p className="text-gray-600">Send SMS and messages to your contacts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card-gradient p-4">
          <p className="text-2xl font-bold text-blue-600">{stats.totalSent}</p>
          <p className="text-sm text-gray-600">Messages Sent</p>
        </div>
        <div className="card-gradient p-4">
          <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
          <p className="text-sm text-gray-600">Delivered</p>
        </div>
        <div className="card-gradient p-4">
          <p className="text-2xl font-bold text-purple-600">{stats.totalReceived}</p>
          <p className="text-sm text-gray-600">Received</p>
        </div>
        <div className="card-gradient p-4">
          <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
          <p className="text-sm text-gray-600">Failed</p>
        </div>
      </div>

      {/* Actions */}
      <div className="card-gradient mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center flex-1">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowBulkModal(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Bulk Send
            </button>
            <button
              onClick={() => setShowComposeModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Message
            </button>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="card-gradient">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No conversations yet</p>
            <button
              onClick={() => setShowComposeModal(true)}
              className="btn-primary"
            >
              Send Your First Message
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setSelectedConversation(conv)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                    {conv.contact ? (
                      `${conv.contact.firstName[0]}${conv.contact.lastName[0]}`
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 truncate">
                        {conv.contact
                          ? `${conv.contact.firstName} ${conv.contact.lastName}`
                          : conv.recipientName || conv.recipientPhone}
                      </h3>
                      {conv.contact && (
                        <span className={`px-2 py-0.5 rounded-full text-xs ${temperatureColors[conv.contact.temperature] || ''}`}>
                          {conv.contact.temperature}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">{conv.lastMessage.content}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      {statusIcons[conv.lastMessage.status]}
                      <span>{new Date(conv.lastMessage.createdAt).toLocaleDateString()}</span>
                      <span>{conv.messageCount} messages</span>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">New Message</h2>
              <button
                onClick={() => {
                  setShowComposeModal(false);
                  setMessageContent('');
                  setSelectedContact(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="p-6 space-y-4">
              {/* Recipient */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                {selectedContact ? (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">
                      {selectedContact.firstName[0]}{selectedContact.lastName[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {selectedContact.firstName} {selectedContact.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{selectedContact.phone}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedContact(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <input type="hidden" name="contactId" value={selectedContact.id} />
                    <input type="hidden" name="recipientPhone" value={selectedContact.phone || ''} />
                    <input type="hidden" name="recipientName" value={`${selectedContact.firstName} ${selectedContact.lastName}`} />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="tel"
                      name="recipientPhone"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      placeholder="Phone number or select contact"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    {contacts.length > 0 && (
                      <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg">
                        {contacts.slice(0, 5).map(contact => (
                          <button
                            key={contact.id}
                            type="button"
                            onClick={() => {
                              setSelectedContact(contact);
                              setRecipientPhone('');
                            }}
                            className="w-full p-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
                          >
                            <Phone className="w-3 h-3 text-gray-400" />
                            {contact.firstName} {contact.lastName}
                            <span className="text-gray-400 ml-auto">{contact.phone}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Templates */}
              {scripts.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quick Templates</label>
                  <div className="flex flex-wrap gap-2">
                    {scripts.slice(0, 4).map(script => (
                      <button
                        key={script.id}
                        type="button"
                        onClick={() => handleTemplateSelect(script)}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
                      >
                        {script.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  name="content"
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  rows={4}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Type your message..."
                />
                <p className="text-xs text-gray-500 mt-1">{messageContent.length} / 160 characters</p>
              </div>

              <input type="hidden" name="type" value="SMS" />

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowComposeModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || (!selectedContact && !recipientPhone)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {isPending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Send Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Bulk Message</h2>
                <p className="text-sm text-gray-600">{selectedContacts.size} contacts selected</p>
              </div>
              <button
                onClick={() => {
                  setShowBulkModal(false);
                  setSelectedContacts(new Set());
                  setMessageContent('');
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Contact Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Contacts</label>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                  {contacts.map(contact => (
                    <label
                      key={contact.id}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                    >
                      <input
                        type="checkbox"
                        checked={selectedContacts.has(contact.id)}
                        onChange={() => toggleContactSelection(contact.id)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {contact.firstName} {contact.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{contact.phone}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${temperatureColors[contact.temperature] || ''}`}>
                        {contact.temperature}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedContacts(new Set(contacts.map(c => c.id)))}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedContacts(new Set())}
                    className="text-sm text-gray-500 hover:underline"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Templates */}
              {scripts.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quick Templates</label>
                  <div className="flex flex-wrap gap-2">
                    {scripts.map(script => (
                      <button
                        key={script.id}
                        type="button"
                        onClick={() => handleTemplateSelect(script)}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
                      >
                        {script.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Type your message..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkSend}
                  disabled={isPending || selectedContacts.size === 0 || !messageContent}
                  className="btn-primary flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {isPending ? 'Sending...' : `Send to ${selectedContacts.size} contacts`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conversation View Modal */}
      {selectedConversation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
                  {selectedConversation.contact ? (
                    `${selectedConversation.contact.firstName[0]}${selectedConversation.contact.lastName[0]}`
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedConversation.contact
                      ? `${selectedConversation.contact.firstName} ${selectedConversation.contact.lastName}`
                      : selectedConversation.recipientName || selectedConversation.recipientPhone}
                  </h3>
                  {selectedConversation.recipientPhone && (
                    <p className="text-sm text-gray-500">{selectedConversation.recipientPhone}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedConversation(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages
                .filter(m =>
                  (selectedConversation.contact && m.contact?.id === selectedConversation.contact.id) ||
                  m.recipientPhone === selectedConversation.recipientPhone
                )
                .reverse()
                .map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        msg.direction === 'OUTBOUND'
                          ? 'bg-blue-600 text-white rounded-br-md'
                          : 'bg-gray-100 text-gray-900 rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <div className={`flex items-center gap-1 mt-1 text-xs ${
                        msg.direction === 'OUTBOUND' ? 'text-blue-200' : 'text-gray-500'
                      }`}>
                        <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>
                        {msg.direction === 'OUTBOUND' && statusIcons[msg.status]}
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <div className="p-4 border-t border-gray-100">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData();
                  formData.set('content', messageContent);
                  formData.set('type', 'SMS');
                  if (selectedConversation.contact) {
                    formData.set('contactId', selectedConversation.contact.id);
                    formData.set('recipientPhone', selectedConversation.contact.phone || '');
                    formData.set('recipientName', `${selectedConversation.contact.firstName} ${selectedConversation.contact.lastName}`);
                  } else {
                    formData.set('recipientPhone', selectedConversation.recipientPhone || '');
                    formData.set('recipientName', selectedConversation.recipientName || '');
                  }

                  startTransition(async () => {
                    await sendMessage(formData);
                    setMessageContent('');
                  });
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={isPending || !messageContent}
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
