import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import API, { documentAPI, mediaAPI } from '../../lib/mergeapi';

const TinyMCEEditor = ({ 
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
  const [editorContent, setEditorContent] = useState(value || "");
  const [isEditorReady, setIsEditorReady] = useState(false);
  
  const editorRef = useRef(null);
  const autoSaveTimer = useRef(null);

  // IMPORTANT: Replace with your actual TinyMCE API key
  // Get a free API key from: https://www.tiny.cloud/auth/signup/
  const TINYMCE_API_KEY = 'n53ftrpiiko95u8i8die1nfh5v55hmc22fnhlyt03cbgcizy'; // <-- REPLACE THIS

  // Load document if documentId is provided
  useEffect(() => {
    if (documentId) {
      loadDocument(documentId);
    }
  }, [documentId]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && !readOnly && documentId && isEditorReady) {
      autoSaveTimer.current = setInterval(() => {
        autoSaveDocument();
      }, autoSaveInterval);
      
      return () => {
        if (autoSaveTimer.current) {
          clearInterval(autoSaveTimer.current);
        }
      };
    }
  }, [autoSave, readOnly, documentId, isEditorReady]);

  // Load document from API
  const loadDocument = async (id) => {
    try {
      setStatusMessage("Loading document...");
      const response = await documentAPI.getDocument(id);
      const document = response.data.data;
      
      setDocumentTitle(document.title || 'Untitled Document');
      setEditorContent(document.content || value || "<p>Start typing your content here...</p>");
      
      setStatusMessage(`Document "${document.title}" loaded successfully`);
    } catch (error) {
      console.error('Failed to load document:', error);
      setStatusMessage(`Error loading document: ${error.response?.data?.message || error.message}`);
    }
  };

  // Save document to API
  const saveDocument = async () => {
    if (readOnly) {
      setStatusMessage("Cannot save - document is in read-only mode");
      return;
    }

    if (!isEditorReady || !editorRef.current) {
      setStatusMessage("Editor not ready yet...");
      return;
    }

    setIsSaving(true);
    setStatusMessage("Saving document...");

    try {
      const content = editorRef.current.getContent() || "";
      
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
        setDocumentTitle(response.data.data.title);
        setStatusMessage(`New document "${response.data.data.title}" created and saved`);
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

  // Auto-save function
  const autoSaveDocument = async () => {
    if (!documentId || readOnly || !isEditorReady || !editorRef.current) return;
    
    try {
      const content = editorRef.current.getContent();
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

  // Publish document
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

  // Custom image upload handler
  const handleImageUpload = async (blobInfo, progress) => {
    return new Promise((resolve, reject) => {
      const file = blobInfo.blob();
      
      if (!file.type.startsWith('image/')) {
        reject({ message: 'Please upload a valid image file' });
        return;
      }

      setStatusMessage(`📸 Uploading image "${file.name}"...`);

      mediaAPI.uploadFile(file, (progressPercent) => {
        progress(progressPercent);
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
  };

  // Handle editor changes
  const handleEditorChange = (content, editor) => {
    setEditorContent(content);
    if (onChange) onChange(content);
  };

  // Handle editor initialization
  const handleEditorInit = (editor) => {
    editorRef.current = editor;
    setIsEditorReady(true);
    
    // Safely add shortcuts only if editor is fully initialized
    if (editor && typeof editor.addShortcut === 'function') {
      // Add custom save shortcut (Ctrl+S / Cmd+S)
      editor.addShortcut('ctrl+s', 'Save document', () => {
        saveDocument();
        return false;
      });
      
      editor.addShortcut('meta+s', 'Save document', () => {
        saveDocument();
        return false;
      });
    } else {
      console.warn('Editor shortcuts not available');
    }
  };

  // Get word count safely
  const getWordCount = useCallback(() => {
    if (!isEditorReady || !editorRef.current) return 0;
    try {
      const content = editorRef.current.getContent({ format: 'text' });
      return content.split(/\s+/).filter(Boolean).length;
    } catch (error) {
      return 0;
    }
  }, [isEditorReady]);

  // TinyMCE configuration
  const editorConfig = {
    height: 600,
    menubar: true,
    readonly: readOnly,
    
    // Plugins for full functionality
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'help', 'wordcount', 'codesample',
      'emoticons', 'template', 'pagebreak', 'nonbreaking', 'directionality',
      'visualchars', 'noneditable', 'importcss', 'quickbars', 'accordion'
    ],
    
    // Toolbar configuration
    toolbar: [
      'undo redo | accordion',
      'removeformat',
      'blocks fontfamily fontsize |',
      'bold italic underline strikethrough | forecolor backcolor',
      'alignleft aligncenter alignright alignjustify | lineheight',
      'outdent indent | numlist bullist |',
      'table link image media |',
      'codesample | charmap emoticons |',
      'fullscreen preview | code help'
    ].join(' '),
    
    // Font families
    font_family_formats: 'Georgia=georgia,times new roman,times,serif;Arial=arial,helvetica,sans-serif;Times New Roman=times new roman,times,serif;Courier New=courier new,courier,monospace;Verdana=verdana,geneva,sans-serif;',
    
    // Font sizes
    font_size_formats: '8pt 9pt 10pt 11pt 12pt 14pt 16pt 18pt 20pt 24pt 28pt 32pt 36pt 48pt 72pt',
    
    // Line heights
    lineheight_formats: '1 1.2 1.5 1.6 1.8 2',
    
    // Image upload handler
    images_upload_handler: handleImageUpload,
    
    // Allow image uploads
    automatic_uploads: true,
    images_upload_url: '/api/upload',
    
    // Table customization
    table_style_by_css: true,
    table_default_attributes: {
      border: '1',
      cellpadding: '8',
      cellspacing: '0',
      style: 'border-collapse: collapse; width: 100%; margin: 10px 0;'
    },
    
    // Link options
    link_title: true,
    link_assume_external_targets: true,
    link_default_target: '_blank',
    
    // Code highlighting
    codesample_global_prismjs: true,
    codesample_languages: [
      { text: 'HTML/XML', value: 'markup' },
      { text: 'JavaScript', value: 'javascript' },
      { text: 'CSS', value: 'css' },
      { text: 'Python', value: 'python' },
      { text: 'Java', value: 'java' }
    ],
    
    // Content styling
    content_style: `
      body {
        font-family: Georgia, 'Times New Roman', Times, serif;
        font-size: 14px;
        line-height: 1.6;
        margin: 2rem;
        padding: 2rem;
        background: white;
      }
      h1 { font-size: 2em; margin: 0.67em 0; }
      h2 { font-size: 1.5em; margin: 0.75em 0; }
      h3 { font-size: 1.17em; margin: 0.83em 0; }
      p { margin: 1em 0; }
      img { max-width: 100%; height: auto; }
    `,
    
    // Spell checking
    browser_spellcheck: true,
    
    // Quickbars for inline editing
    quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote',
    quickbars_insert_toolbar: 'quickimage quicktable | hr',
    
    // Paste settings
    paste_data_images: true,
    
    // Statusbar
    statusbar: true,
    elementpath: true,
    resize: true,
    
    // Disable branding if you have a premium key (optional)
    branding: true
  };

  return (
    <div className="w-full flex flex-col bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
      {/* Title Bar - Only show if documentId is provided */}
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
              >
                <span>🚀</span>
                <span>Publish</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* TinyMCE Editor */}
      <div className="relative">
        <Editor
          apiKey={TINYMCE_API_KEY}
          value={editorContent}
          onInit={handleEditorInit}
          onEditorChange={handleEditorChange}
          init={editorConfig}
          disabled={readOnly}
          id="tinymce-editor"
        />
      </div>

      {/* Status Bar */}
      <div className="bg-gray-100 border-t border-gray-200 px-4 py-1.5 flex justify-between items-center text-xs">
        <div className="flex gap-4">
          <div className="flex items-center gap-1">
            <span className="text-green-600">●</span>
            <span className="text-gray-600">Ready</span>
          </div>
          {lastSaved && (
            <div className="flex items-center gap-1 text-gray-500">
              <span>⏱️</span>
              <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
            </div>
          )}
          {isEditorReady && (
            <div className="flex items-center gap-1 text-gray-500">
              <span>📊</span>
              <span>Words: {getWordCount()}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-32 text-right text-gray-500 truncate" title={statusMessage}>
            {statusMessage}
          </div>
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

export default TinyMCEEditor;