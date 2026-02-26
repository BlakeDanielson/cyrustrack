'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { MessageSquare, Plus, Pencil, Trash2, Save, X } from 'lucide-react';
import { useConsumptionStore } from '@/store/consumption';
import { SessionImage } from '@/types/consumption';
import ImageUpload from './ImageUpload';

const FeedbackNotes: React.FC = () => {
  const {
    feedbackEntries,
    addFeedbackEntry,
    updateFeedbackEntry,
    deleteFeedbackEntry,
  } = useConsumptionStore();

  const [newFeedback, setNewFeedback] = useState('');
  const [newFeedbackImages, setNewFeedbackImages] = useState<SessionImage[]>([]);
  const [newFeedbackTempSessionId, setNewFeedbackTempSessionId] = useState(`temp_feedback_${Date.now()}`);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [editingImages, setEditingImages] = useState<SessionImage[]>([]);
  const [editingTempSessionId, setEditingTempSessionId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<SessionImage | null>(null);

  const handleCreate = () => {
    if (!newFeedback.trim()) return;
    addFeedbackEntry(newFeedback, newFeedbackImages);
    setNewFeedback('');
    setNewFeedbackImages([]);
    setNewFeedbackTempSessionId(`temp_feedback_${Date.now()}`);
  };

  const handleStartEdit = (id: string, content: string, images?: SessionImage[]) => {
    setEditingId(id);
    setEditingContent(content);
    setEditingImages(images || []);
    setEditingTempSessionId(`temp_feedback_edit_${id}_${Date.now()}`);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editingContent.trim()) return;
    updateFeedbackEntry(editingId, editingContent, editingImages);
    setEditingId(null);
    setEditingContent('');
    setEditingImages([]);
    setEditingTempSessionId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingContent('');
    setEditingImages([]);
    setEditingTempSessionId(null);
  };

  const deleteImageById = async (imageId: string) => {
    try {
      await fetch(`/api/images/upload?id=${imageId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete feedback image:', error);
    }
  };

  const handleDelete = async (id: string, images?: SessionImage[]) => {
    if (images?.length) {
      await Promise.all(images.map((image) => deleteImageById(image.id)));
    }

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
        <div className="mt-4">
          <ImageUpload
            sessionId={newFeedbackTempSessionId}
            onImageUploaded={(image) => {
              setNewFeedbackImages((prev) => [...prev, image]);
            }}
            onImageDeleted={(imageId) => {
              setNewFeedbackImages((prev) => prev.filter((img) => img.id !== imageId));
            }}
            existingImages={newFeedbackImages}
            maxImages={4}
          />
        </div>
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

                {isEditing && editingTempSessionId && (
                  <div className="mt-3">
                    <ImageUpload
                      sessionId={editingTempSessionId}
                      onImageUploaded={(image) => {
                        setEditingImages((prev) => [...prev, image]);
                      }}
                      onImageDeleted={(imageId) => {
                        setEditingImages((prev) => prev.filter((img) => img.id !== imageId));
                      }}
                      existingImages={editingImages}
                      maxImages={4}
                    />
                  </div>
                )}

                {!isEditing && entry.images && entry.images.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {entry.images.map((image) => (
                      <button
                        key={image.id}
                        type="button"
                        onClick={() => setLightboxImage(image)}
                        className="group relative rounded-md border border-gray-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-green-500"
                        aria-label={`Open image ${image.filename} in full screen`}
                      >
                        <Image
                          src={image.blob_url}
                          alt={image.alt_text || image.filename}
                          width={200}
                          height={96}
                          className="w-full h-24 object-cover transition-transform group-hover:scale-[1.02]"
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>
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
                        onClick={() => handleStartEdit(entry.id, entry.content, entry.images)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(entry.id, entry.images)}
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

      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute -top-12 right-0 text-white bg-black/40 hover:bg-black/60 rounded-full p-2"
              aria-label="Close full screen image"
            >
              <X className="h-5 w-5" />
            </button>
            <Image
              src={lightboxImage.blob_url}
              alt={lightboxImage.alt_text || lightboxImage.filename}
              width={1400}
              height={900}
              className="w-full max-h-[80vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackNotes;
