'use client';

import React, { useState } from 'react';
import { MessageSquare, Plus, Pencil, Trash2, Save, X } from 'lucide-react';
import { useConsumptionStore } from '@/store/consumption';

const FeedbackNotes: React.FC = () => {
  const {
    feedbackEntries,
    addFeedbackEntry,
    updateFeedbackEntry,
    deleteFeedbackEntry,
  } = useConsumptionStore();

  const [newFeedback, setNewFeedback] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  const handleCreate = () => {
    if (!newFeedback.trim()) return;
    addFeedbackEntry(newFeedback);
    setNewFeedback('');
  };

  const handleStartEdit = (id: string, content: string) => {
    setEditingId(id);
    setEditingContent(content);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editingContent.trim()) return;
    updateFeedbackEntry(editingId, editingContent);
    setEditingId(null);
    setEditingContent('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingContent('');
  };

  const handleDelete = (id: string) => {
    deleteFeedbackEntry(id);
    if (editingId === id) {
      handleCancelEdit();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="h-6 w-6 text-green-600" />
        <h1 className="text-2xl font-bold text-gray-900">Feedback</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Leave a note for later
        </label>
        <textarea
          value={newFeedback}
          onChange={(e) => setNewFeedback(e.target.value)}
          placeholder="Write yourself a reminder, idea, or follow-up..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-y"
        />
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={handleCreate}
            disabled={!newFeedback.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="h-4 w-4" />
            Save Note
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {feedbackEntries.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-500">
            No feedback notes yet. Add your first one above.
          </div>
        ) : (
          feedbackEntries.map((entry) => {
            const isEditing = editingId === entry.id;
            const updatedLabel = new Date(entry.updated_at).toLocaleString();

            return (
              <div key={entry.id} className="bg-white rounded-lg border border-gray-200 p-4">
                {isEditing ? (
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-y"
                  />
                ) : (
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{entry.content}</p>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-gray-500">Last updated: {updatedLabel}</span>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={handleSaveEdit}
                          disabled={!editingContent.trim()}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50"
                        >
                          <Save className="h-3.5 w-3.5" />
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                          <X className="h-3.5 w-3.5" />
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleStartEdit(entry.id, entry.content)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(entry.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-red-100 text-red-700 hover:bg-red-200"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default FeedbackNotes;
