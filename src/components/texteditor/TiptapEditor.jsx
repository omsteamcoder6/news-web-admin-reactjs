import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import CharacterCount from '@tiptap/extension-character-count';
import API, { documentAPI, mediaAPI } from '../../lib/mergeapi';

const TiptapEditor = ({ 
  value = "", 
  onChange, 
  documentId = null,
  readOnly = false,
  autoSave = true,
  autoSaveInterval = 30000
}) => {
  const [documentTitle, setDocumentTitle] = useState('Untitled Document');
  const [statusMessage, setStatusMessage] = useState("Ready");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  
  const autoSaveTimer = useRef(null);
  const saveTimeoutRef = useRef(null);
  const editorRef = useRef(null);

  // Tiptap editor configuration - MOVE THIS BEFORE the functions that use it
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: {
          HTMLAttributes: {
            class: 'rounded-md bg-gray-100 p-4 font-mono text-sm',
          },
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg shadow-sm',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      Placeholder.configure({
        placeholder: 'Start typing your content here...',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      Highlight,
      Typography,
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse border border-gray-300 w-full my-4',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      CharacterCount.configure({
        limit: null,
      }),
    ],
    content: value || "",
    editable: !readOnly,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[600px] p-8 max-w-none',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setStatusMessage("Editing...");
      if (onChange) onChange(html);
      
      if (autoSave && documentId && !readOnly) {
        debouncedSave();
      }
    },
    onTransaction: () => {
      if (!isEditorReady) {
        setIsEditorReady(true);
      }
    },
  });

  // Store editor in ref for use in functions
  useEffect(() => {
    if (editor) {
      editorRef.current = editor;
    }
  }, [editor]);

  const loadDocument = async (id) => {
    try {
      setStatusMessage("Loading document...");
      const response = await documentAPI.getDocument(id);
      const document = response.data.data;
      
      setDocumentTitle(document.title || 'Untitled Document');
      
      // Use the ref or check if editor exists
      if (editorRef.current && document.content) {
        editorRef.current.commands.setContent(document.content);
      } else if (editor && document.content) {
        editor.commands.setContent(document.content);
      }
      
      setStatusMessage(`Document "${document.title}" loaded successfully`);
    } catch (error) {
      console.error('Failed to load document:', error);
      setStatusMessage(`Error loading document: ${error.response?.data?.message || error.message}`);
    }
  };

  const saveDocument = async () => {
    if (readOnly) {
      setStatusMessage("Cannot save - document is in read-only mode");
      return;
    }

    const currentEditor = editorRef.current || editor;
    if (!currentEditor) {
      setStatusMessage("Editor not ready yet...");
      return;
    }

    setIsSaving(true);
    setStatusMessage("Saving document...");

    try {
      const content = currentEditor.getHTML();
      
      const documentData = {
        title: documentTitle,
        content: content,
        lastModified: new Date().toISOString()
      };

      let response;
      if (documentId) {
        response = await documentAPI.updateDocument(documentId, documentData);
        setStatusMessage(`Document "${documentTitle}" saved successfully`);
      } else {
        response = await documentAPI.createDocument(documentData);
        if (response?.data?.data) {
          setDocumentTitle(response.data.data.title);
        }
        setStatusMessage(`New document "${response?.data?.data?.title || documentTitle}" created and saved`);
      }

      setLastSaved(new Date());
      if (onChange) onChange(content);
      
    } catch (error) {
      console.error('Failed to save document:', error);
      setStatusMessage(`Error saving document: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      if (documentId && (editorRef.current || editor) && !readOnly) {
        autoSaveDocument();
      }
    }, 2000);
  }, [documentId, editor, readOnly]);

  const autoSaveDocument = async () => {
    const currentEditor = editorRef.current || editor;
    if (!documentId || readOnly || !currentEditor) return;
    
    try {
      const content = currentEditor.getHTML();
      await documentAPI.saveAsDraft(documentId, content);
      setLastSaved(new Date());
      setStatusMessage("Auto-saved as draft");
      
      setTimeout(() => {
        if (statusMessage === "Auto-saved as draft") {
          setStatusMessage("Ready");
        }
      }, 2000);
      
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const publishDocument = async () => {
    if (!documentId) {
      setStatusMessage("Please save the document first before publishing");
      return;
    }

    try {
      setStatusMessage("Publishing document...");
      const response = await documentAPI.publishDocument(documentId);
      setStatusMessage(`Document published successfully! Status: ${response.data.data.status}`);
    } catch (error) {
      console.error('Failed to publish document:', error);
      setStatusMessage(`Error publishing document: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleImageUpload = useCallback(async (file) => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject({ message: 'Please upload a valid image file' });
        return;
      }

      setStatusMessage(`📸 Uploading image "${file.name}"...`);

      mediaAPI.uploadFile(file, (progressPercent) => {
        setStatusMessage(`📸 Uploading image: ${progressPercent}%`);
      })
      .then(response => {
        const imageUrl = mediaAPI.getImageUrl(response.data.url);
        setStatusMessage(`✅ Image uploaded successfully`);
        resolve(imageUrl);
      })
      .catch(error => {
        console.error('Image upload failed:', error);
        setStatusMessage(`❌ Failed to upload image: ${error.response?.data?.message || error.message}`);
        reject({ message: error.response?.data?.message || 'Upload failed' });
      });
    });
  }, []);

  const addImage = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async () => {
      const file = input.files?.[0];
      const currentEditor = editorRef.current || editor;
      if (file && currentEditor) {
        try {
          const imageUrl = await handleImageUpload(file);
          currentEditor.chain().focus().setImage({ src: imageUrl }).run();
        } catch (error) {
          console.error('Failed to insert image:', error);
        }
      }
    };
    
    input.click();
  }, [editor, handleImageUpload]);

  const insertTable = useCallback(() => {
    const currentEditor = editorRef.current || editor;
    if (currentEditor) {
      currentEditor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    }
  }, [editor]);

  // Load document after editor is ready
  useEffect(() => {
    if (documentId && editor) {
      loadDocument(documentId);
    }
  }, [documentId, editor]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && !readOnly && documentId && isEditorReady && editor) {
      autoSaveTimer.current = setInterval(() => {
        autoSaveDocument();
      }, autoSaveInterval);
      
      return () => {
        if (autoSaveTimer.current) {
          clearInterval(autoSaveTimer.current);
        }
      };
    }
  }, [autoSave, readOnly, documentId, isEditorReady, editor]);

  // Set up keyboard shortcuts
  useEffect(() => {
    const currentEditor = editorRef.current || editor;
    if (currentEditor && !readOnly) {
      const handleKeyDown = (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
          event.preventDefault();
          saveDocument();
        }
      };
      
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [editor, readOnly, saveDocument]);

  const getWordCount = useCallback(() => {
    const currentEditor = editorRef.current || editor;
    if (!currentEditor) return 0;
    const text = currentEditor.getText();
    return text.split(/\s+/).filter(Boolean).length;
  }, [editor]);

  const getCharacterCount = useCallback(() => {
    const currentEditor = editorRef.current || editor;
    if (!currentEditor) return 0;
    return currentEditor.getText().length;
  }, [editor]);

  const ToolbarButton = ({ onClick, active, disabled, children, title }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded transition-colors ${
        active 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      title={title}
      type="button"
    >
      {children}
    </button>
  );

  return (
    <div className="w-full flex flex-col bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
      {/* Title Bar */}
      {documentId && (
        <div className="bg-gradient-to-r from-blue-700 to-blue-800 px-4 py-2 flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 cursor-pointer transition-colors" />
            <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 cursor-pointer transition-colors" />
            <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 cursor-pointer transition-colors" />
          </div>
          
          <div className="flex items-center gap-2 flex-1">
            <span className="text-white/60 text-sm">📄</span>
            <input
              type="text"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              onBlur={() => documentId && saveDocument()}
              disabled={readOnly}
              className="bg-transparent text-white text-sm font-medium px-2 py-1 rounded border border-transparent hover:border-white/30 focus:border-white/50 focus:outline-none focus:bg-white/10 transition-all"
              style={{ minWidth: '200px' }}
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={saveDocument}
              disabled={isSaving || readOnly || !isEditorReady}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white text-sm px-3 py-1 rounded flex items-center gap-1 transition-colors shadow-sm"
              type="button"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>Save</span>
                </>
              )}
            </button>
            
            {documentId && (
              <button
                onClick={publishDocument}
                disabled={readOnly || !isEditorReady}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white text-sm px-3 py-1 rounded flex items-center gap-1 transition-colors shadow-sm"
                type="button"
              >
                <span>🚀</span>
                <span>Publish</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Toolbar */}
      {!readOnly && (editorRef.current || editor) && (
        <div className="bg-white border-b border-gray-200 p-2 flex flex-wrap gap-1 sticky top-0 z-10">
          <ToolbarButton
            onClick={() => {
              const currentEditor = editorRef.current || editor;
              currentEditor?.chain().focus().toggleBold().run();
            }}
            active={editor?.isActive('bold') || editorRef.current?.isActive('bold')}
            title="Bold (Ctrl+B)"
          >
            <strong>B</strong>
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => {
              const currentEditor = editorRef.current || editor;
              currentEditor?.chain().focus().toggleItalic().run();
            }}
            active={editor?.isActive('italic') || editorRef.current?.isActive('italic')}
            title="Italic (Ctrl+I)"
          >
            <em>I</em>
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => {
              const currentEditor = editorRef.current || editor;
              currentEditor?.chain().focus().toggleStrike().run();
            }}
            active={editor?.isActive('strike') || editorRef.current?.isActive('strike')}
            title="Strikethrough"
          >
            <s>S</s>
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => {
              const currentEditor = editorRef.current || editor;
              currentEditor?.chain().focus().toggleCode().run();
            }}
            active={editor?.isActive('code') || editorRef.current?.isActive('code')}
            title="Code"
          >
            {"<>"}
          </ToolbarButton>
          
          <div className="w-px h-6 bg-gray-300 mx-1" />
          
          <ToolbarButton
            onClick={() => {
              const currentEditor = editorRef.current || editor;
              currentEditor?.chain().focus().toggleHeading({ level: 1 }).run();
            }}
            active={editor?.isActive('heading', { level: 1 }) || editorRef.current?.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            H1
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => {
              const currentEditor = editorRef.current || editor;
              currentEditor?.chain().focus().toggleHeading({ level: 2 }).run();
            }}
            active={editor?.isActive('heading', { level: 2 }) || editorRef.current?.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            H2
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => {
              const currentEditor = editorRef.current || editor;
              currentEditor?.chain().focus().toggleHeading({ level: 3 }).run();
            }}
            active={editor?.isActive('heading', { level: 3 }) || editorRef.current?.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            H3
          </ToolbarButton>
          
          <div className="w-px h-6 bg-gray-300 mx-1" />
          
          <ToolbarButton
            onClick={() => {
              const currentEditor = editorRef.current || editor;
              currentEditor?.chain().focus().toggleBulletList().run();
            }}
            active={editor?.isActive('bulletList') || editorRef.current?.isActive('bulletList')}
            title="Bullet List"
          >
            • List
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => {
              const currentEditor = editorRef.current || editor;
              currentEditor?.chain().focus().toggleOrderedList().run();
            }}
            active={editor?.isActive('orderedList') || editorRef.current?.isActive('orderedList')}
            title="Numbered List"
          >
            1. List
          </ToolbarButton>
          
          <div className="w-px h-6 bg-gray-300 mx-1" />
          
          <ToolbarButton
            onClick={() => {
              const currentEditor = editorRef.current || editor;
              currentEditor?.chain().focus().setTextAlign('left').run();
            }}
            active={editor?.isActive({ textAlign: 'left' }) || editorRef.current?.isActive({ textAlign: 'left' })}
            title="Align Left"
          >
            ←
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => {
              const currentEditor = editorRef.current || editor;
              currentEditor?.chain().focus().setTextAlign('center').run();
            }}
            active={editor?.isActive({ textAlign: 'center' }) || editorRef.current?.isActive({ textAlign: 'center' })}
            title="Center"
          >
            ↔
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => {
              const currentEditor = editorRef.current || editor;
              currentEditor?.chain().focus().setTextAlign('right').run();
            }}
            active={editor?.isActive({ textAlign: 'right' }) || editorRef.current?.isActive({ textAlign: 'right' })}
            title="Align Right"
          >
            →
          </ToolbarButton>
          
          <div className="w-px h-6 bg-gray-300 mx-1" />
          
          <ToolbarButton
            onClick={addImage}
            title="Insert Image"
          >
            🖼️
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => {
              const url = window.prompt('Enter URL:');
              const currentEditor = editorRef.current || editor;
              if (url && currentEditor) {
                currentEditor.chain().focus().setLink({ href: url }).run();
              }
            }}
            active={editor?.isActive('link') || editorRef.current?.isActive('link')}
            title="Insert Link"
          >
            🔗
          </ToolbarButton>
          
          <ToolbarButton
            onClick={insertTable}
            title="Insert Table"
          >
            📊
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => {
              const currentEditor = editorRef.current || editor;
              currentEditor?.chain().focus().toggleCodeBlock().run();
            }}
            active={editor?.isActive('codeBlock') || editorRef.current?.isActive('codeBlock')}
            title="Code Block"
          >
            {"</>"}
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => {
              const currentEditor = editorRef.current || editor;
              currentEditor?.chain().focus().toggleBlockquote().run();
            }}
            active={editor?.isActive('blockquote') || editorRef.current?.isActive('blockquote')}
            title="Quote"
          >
            "
          </ToolbarButton>
          
          <div className="w-px h-6 bg-gray-300 mx-1" />
          
          <ToolbarButton
            onClick={() => {
              const currentEditor = editorRef.current || editor;
              currentEditor?.chain().focus().undo().run();
            }}
            disabled={!editor?.can().undo() && !editorRef.current?.can().undo()}
            title="Undo (Ctrl+Z)"
          >
            ↩️
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => {
              const currentEditor = editorRef.current || editor;
              currentEditor?.chain().focus().redo().run();
            }}
            disabled={!editor?.can().redo() && !editorRef.current?.can().redo()}
            title="Redo (Ctrl+Y)"
          >
            ↪️
          </ToolbarButton>
        </div>
      )}

      {/* Tiptap Editor */}
      <div className="relative bg-white">
        <EditorContent editor={editor} />
      </div>

      {/* Status Bar */}
      <div className="bg-gray-100 border-t border-gray-200 px-4 py-1.5 flex justify-between items-center text-xs">
        <div className="flex gap-4">
          <div className="flex items-center gap-1">
            <span className="text-green-600">●</span>
            <span className="text-gray-600">{statusMessage}</span>
          </div>
          {lastSaved && (
            <div className="flex items-center gap-1 text-gray-500">
              <span>⏱️</span>
              <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
            </div>
          )}
          {(editorRef.current || editor) && (
            <>
              <div className="flex items-center gap-1 text-gray-500">
                <span>📊</span>
                <span>Words: {getWordCount()}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <span>📝</span>
                <span>Chars: {getCharacterCount()}</span>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {autoSave && documentId && !readOnly && isEditorReady && (
            <div className="text-blue-600 text-xs">
              ⚡ Auto-save enabled
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TiptapEditor;