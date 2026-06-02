import { useState, useEffect, useRef } from 'react';

// ─── Data ────────────────────────────────────────────────────────────────────

const POSITION_CATEGORIES = {
    'Header': ['Above Logo', 'Below Logo', 'Full Width Strip', 'Sticky Header'],
    'Navigation': ['Inside Menu', 'Beside Menu', 'Dropdown Menu'],
    'Content': ['Before Title', 'After Title', 'Before Content', 'After Content', 'Between Paragraphs', 'After 1st Paragraph', 'After 2nd Paragraph', 'After 3rd Paragraph', 'Between Images'],
    'Sidebar': ['Top Sidebar', 'Middle Sidebar', 'Bottom Sidebar', 'Sticky Sidebar'],
    'Footer': ['Above Footer', 'Inside Footer', 'After Footer', 'Sticky Footer'],
    'Between Posts': ['Every 1st Post', 'Every 2nd Post', 'Every 3rd Post', 'After Every Post'],
    'Video Player': ['Pre-roll', 'Mid-roll', 'Post-roll', 'Pause Ad'],

    // ========== POPUP POSITIONS (47 Options) ==========
    'Popup': [
        // Original Positions
        'On Load',
        'On Scroll',
        'On Exit Intent',
        'On Click',
        'Timed Popup',

        // Time-Based Positions
        'On Load Delay 5s',
        'On Load Delay 10s',
        'On Load Delay 30s',
        'On Idle',
        'On Return',
        'Every 30s',
        'Every 60s',

        // Scroll-Based Positions
        'On Scroll 25%',
        'On Scroll 50%',
        'On Scroll 75%',
        'On Scroll 100%',
        'On Scroll Up',
        'On Scroll Down',
        'After First Scroll',

        // Interaction-Based Positions
        'On Click Anywhere',
        'On Click Link',
        'On Button Hover',
        'On Image Click',
        'On Form Focus',
        'On Video Pause',
        'On Video End',

        // Page Navigation Positions
        'On Page Change',
        'On Back Button',
        'On Refresh',
        'Before Unload',

        // Element-Based Positions
        'On Menu Open',
        'On Search',
        'On Filter',
        'On Add to Cart',
        'On Checkout',
        'On Share',

        // Session-Based Positions
        'On First Visit',
        'On Second Visit',
        'Every 3rd Page',
        'On Return Visit',
        'After 5 Seconds',
        'After 10 Seconds',

        // Mobile-Specific Positions
        'On Swipe',
        'On Orientation Change',
        'On Touch Start',
        'On Mobile Menu',
        'On Keyboard Open'
    ],
    // ========== END OF POPUP POSITIONS ==========

    'Floating': ['Corner Widget', 'Sticky Bottom', 'Slide-in Left', 'Slide-in Right'],
    'Interstitial': ['Full Screen', 'Between Pages'],
    'Homepage Premium': ['Top Banner', 'Middle Banner', 'Bottom Banner'],
    'Article Middle': ['After Title', 'Before Content', 'After Content', 'Between Paragraphs'],
    'Top Banner': ['Top of Page', 'Below Header'],
    'Between News Cards': ['Between Card 1-2', 'Between Card 2-3', 'Between Card 3-4'],
    'Sticky Bottom': ['Fixed Bottom']
};

const ROTATION_METHODS = [
    { value: 'round_robin', label: 'Round Robin', description: 'Ads rotate in sequence (1→2→3→repeat)' },
    { value: 'random', label: 'Random', description: 'Pick any active ad randomly' },
    { value: 'weighted', label: 'Weighted', description: 'Show based on weight percentage' },
    { value: 'targeted', label: 'Targeted', description: 'Show based on user location, device, behaviour' }
];

const defaultForm = () => ({
    title: '',
    description: '',
    type: 'banner',
    images: [],
    videoUrl: '',
    videoFile: null,
    brandName: '',
    brandLogo: '',
    linkUrl: '',
    placementCategory: 'Header',
    placementPosition: 'Above Logo',
    targetPages: ['all'],
    targetDevices: ['desktop'],
    targetAudiences: [],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    pricingModel: 'cpc',
    budget: 0,
    costPerUnit: 0,
    rotationMethod: 'random',
    rotationWeight: 100,
    rotationGroupId: null,
    isPartOfRotation: false,
    targetLocations: [],
    targetBehaviors: [],
    targetTimeOfDay: [],
    frequencyCap: null,
    frequencyCapInterval: 'day',
    adSize: null,
    deviceCategory: 'both',
    displayDuration: null,
    autoHide: false,
    autoClosePopup: true,
    // NEW: Ad Slot Assignment Fields
    adSlot1Enabled: false,
    adSlot2Enabled: false,
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = {
    overlay: {
        position: 'fixed', inset: 0,
        background: 'rgba(15,15,15,0.55)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
    },
    modal: {
        background: '#fff',
        borderRadius: '20px',
        width: '100%', maxWidth: '820px',
        maxHeight: '92vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 32px 80px rgba(0,0,0,0.18)',
        overflow: 'hidden',
    },
    header: {
        padding: '28px 32px 24px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    },
    headerTitle: { fontSize: '20px', fontWeight: 700, color: '#111', margin: 0 },
    headerSub: { fontSize: '13px', color: '#888', marginTop: '4px' },
    closeBtn: {
        background: '#f4f4f4', border: 'none', borderRadius: '10px',
        width: '36px', height: '36px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '18px', color: '#555', flexShrink: 0,
        transition: 'background 0.15s',
    },
    body: { padding: '28px 32px', overflowY: 'auto', flex: 1, gap: '0' },
    section: { marginBottom: '28px' },
    sectionHeader: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '16px',
    },
    sectionTitle: {
        fontSize: '13px', fontWeight: 700, letterSpacing: '0.06em',
        textTransform: 'uppercase', color: '#888',
    },
    row: { display: 'grid', gap: '16px', gridTemplateColumns: '1fr 1fr', marginBottom: '16px' },
    row3: { display: 'grid', gap: '16px', gridTemplateColumns: '1fr 1fr 1fr', marginBottom: '16px' },
    rowFull: { display: 'grid', gap: '16px', gridTemplateColumns: '1fr', marginBottom: '16px' },
    field: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '12px', fontWeight: 600, color: '#555', letterSpacing: '0.02em' },
    input: {
        border: '1.5px solid #e8e8e8',
        borderRadius: '10px',
        padding: '10px 14px',
        fontSize: '14px',
        color: '#111',
        outline: 'none',
        transition: 'border-color 0.15s',
        background: '#fafafa',
        width: '100%',
        boxSizing: 'border-box',
    },
    select: {
        border: '1.5px solid #e8e8e8',
        borderRadius: '10px',
        padding: '10px 14px',
        fontSize: '14px',
        color: '#111',
        outline: 'none',
        background: '#fafafa',
        width: '100%',
        boxSizing: 'border-box',
        cursor: 'pointer',
        appearance: 'auto',
    },
    textarea: {
        border: '1.5px solid #e8e8e8',
        borderRadius: '10px',
        padding: '10px 14px',
        fontSize: '14px',
        color: '#111',
        outline: 'none',
        background: '#fafafa',
        width: '100%',
        resize: 'vertical',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
    },
    hint: { fontSize: '11px', color: '#aaa', marginTop: '2px' },
    badge: (color) => ({
        display: 'inline-block', padding: '2px 10px',
        borderRadius: '20px', fontSize: '11px', fontWeight: 600,
        background: color === 'green' ? '#edfbf3' : '#f4f4f4',
        color: color === 'green' ? '#22a05a' : '#888',
    }),
    infoBox: (color) => ({
        background: color === 'blue' ? '#eff6ff' : color === 'amber' ? '#fffbeb' : '#f9fafb',
        border: `1px solid ${color === 'blue' ? '#bfdbfe' : color === 'amber' ? '#fde68a' : '#e5e7eb'}`,
        borderRadius: '12px',
        padding: '12px 16px',
        fontSize: '13px',
        color: color === 'blue' ? '#1e40af' : color === 'amber' ? '#92400e' : '#374151',
        marginTop: '8px',
    }),
    toggleSection: {
        border: '1.5px solid #f0f0f0',
        borderRadius: '14px',
        overflow: 'visible',
        marginBottom: '16px',
    },
    toggleHeader: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 18px',
        cursor: 'pointer',
        background: 'none', border: 'none', width: '100%',
        textAlign: 'left',
    },
    toggleBody: { padding: '0 18px 18px' },
    pillBtn: (active) => ({
        padding: '7px 14px',
        borderRadius: '20px',
        border: `1.5px solid ${active ? '#f97316' : '#e8e8e8'}`,
        background: active ? '#fff7ed' : '#fafafa',
        color: active ? '#ea580c' : '#555',
        fontSize: '13px', fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.15s',
    }),
    summaryCard: {
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '14px',
        padding: '16px 20px',
        marginTop: '16px',
    },
    summaryRow: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '5px 0', fontSize: '13px',
    },
    footer: {
        padding: '20px 32px',
        borderTop: '1px solid #f0f0f0',
        display: 'flex', justifyContent: 'flex-end', gap: '12px',
        background: '#fff',
    },
    btnOutline: {
        padding: '10px 22px', borderRadius: '10px',
        border: '1.5px solid #e8e8e8',
        background: '#fff', color: '#555',
        fontSize: '14px', fontWeight: 600,
        cursor: 'pointer',
    },
    btnPrimary: (disabled) => ({
        padding: '10px 24px', borderRadius: '10px',
        background: disabled ? '#fed7aa' : '#f97316',
        color: '#fff', border: 'none',
        fontSize: '14px', fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.15s',
    }),
    divider: { height: '1px', background: '#f4f4f4', margin: '8px 0 24px' },
    checkRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' },
    imageGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '16px',
        marginTop: '16px',
    },
    imageCard: (isMain) => ({
        position: 'relative',
        borderRadius: '12px',
        overflow: 'hidden',
        border: isMain ? '3px solid #f97316' : '1px solid #e8e8e8',
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    }),
    mainBadge: {
        position: 'absolute',
        top: '8px',
        left: '8px',
        background: '#f97316',
        color: '#fff',
        fontSize: '10px',
        fontWeight: 700,
        padding: '2px 8px',
        borderRadius: '20px',
        zIndex: 2,
    },
    imageActions: {
        position: 'absolute',
        bottom: '0',
        left: '0',
        right: '0',
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        justifyContent: 'center',
        gap: '12px',
        padding: '8px',
        backdropFilter: 'blur(4px)',
    },
    actionBtn: (color) => ({
        background: 'none',
        border: 'none',
        color: color || '#fff',
        cursor: 'pointer',
        fontSize: '14px',
        padding: '4px 8px',
        borderRadius: '6px',
        transition: 'background 0.15s',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
    }),
    typeSelector: {
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
    },
    typeOption: (active) => ({
        flex: 1,
        padding: '12px 16px',
        borderRadius: '12px',
        border: `2px solid ${active ? '#f97316' : '#e8e8e8'}`,
        background: active ? '#fff7ed' : '#fafafa',
        color: active ? '#ea580c' : '#555',
        cursor: 'pointer',
        textAlign: 'center',
        fontWeight: 600,
        fontSize: '14px',
        transition: 'all 0.15s',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
    }),
    typeIcon: { fontSize: '20px' },
};

// ─── Multiple Image Upload Component ─────────────────────────────────────────

function MultipleImageUpload({ images = [], onChange, maxImages = 10 }) {
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef(null);

    const handleFile = (file) => {
        if (!file || !file.type.startsWith('image/')) return;
        if (images.length >= maxImages) {
            alert(`Maximum ${maxImages} images allowed`);
            return;
        }

        const newImage = {
            id: Date.now() + Math.random(),
            file: file,
            preview: URL.createObjectURL(file),
            isMain: images.length === 0,
        };
        onChange([...images, newImage]);
    };

    const handleMultipleFiles = (files) => {
        const remainingSlots = maxImages - images.length;
        const filesToUpload = Array.from(files).slice(0, remainingSlots);

        filesToUpload.forEach(file => {
            if (file.type.startsWith('image/')) {
                const newImage = {
                    id: Date.now() + Math.random(),
                    file: file,
                    preview: URL.createObjectURL(file),
                    isMain: images.length === 0,
                };
                onChange([...images, newImage]);
            }
        });
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        handleMultipleFiles(e.dataTransfer.files);
    };

    const removeImage = (id) => {
        const imgToRemove = images.find(img => img.id === id);
        if (imgToRemove?.preview) {
            URL.revokeObjectURL(imgToRemove.preview);
        }
        const newImages = images.filter(img => img.id !== id);
        const removedWasMain = images.find(img => img.id === id)?.isMain;
        if (removedWasMain && newImages.length > 0) {
            newImages[0].isMain = true;
        }
        onChange(newImages);
    };

    const setAsMain = (id) => {
        const newImages = images.map(img => ({
            ...img,
            isMain: img.id === id,
        }));
        onChange(newImages);
    };

    const reorderImages = (dragIndex, dropIndex) => {
        const newImages = [...images];
        const [draggedItem] = newImages.splice(dragIndex, 1);
        newImages.splice(dropIndex, 0, draggedItem);
        onChange(newImages);
    };

    const zone = {
        border: `2px dashed ${dragOver ? '#f97316' : '#e0e0e0'}`,
        borderRadius: '12px',
        background: dragOver ? '#fff7ed' : '#fafafa',
        transition: 'all 0.18s',
        cursor: 'pointer',
        padding: '24px 20px',
        textAlign: 'center',
    };

    return (
        <div>
            <div
                style={zone}
                onClick={() => inputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={e => handleMultipleFiles(e.target.files)}
                />
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🖼️</div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#444', margin: 0 }}>
                    {dragOver ? 'Drop to upload' : 'Drag & drop or click to upload'}
                </p>
                <p style={{ fontSize: '11px', color: '#aaa', margin: '4px 0 0' }}>
                    PNG, JPG, GIF, WebP — max 5 MB each (up to {maxImages} images)
                </p>
                <button
                    type="button"
                    onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}
                    style={{
                        marginTop: '12px', padding: '7px 18px',
                        borderRadius: '8px', border: '1.5px solid #e8e8e8',
                        background: '#fff', fontSize: '12px',
                        fontWeight: 600, color: '#555', cursor: 'pointer',
                    }}
                >
                    Browse Files
                </button>
            </div>

            {images.length > 0 && (
                <div style={s.imageGrid}>
                    {images.map((img, idx) => (
                        <div
                            key={img.id}
                            style={s.imageCard(img.isMain)}
                            draggable
                            onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', idx);
                                e.target.style.opacity = '0.5';
                            }}
                            onDragEnd={(e) => { e.target.style.opacity = '1'; }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
                                const dropIndex = idx;
                                if (dragIndex !== dropIndex) {
                                    reorderImages(dragIndex, dropIndex);
                                }
                            }}
                        >
                            {img.isMain && <span style={s.mainBadge}>★ MAIN</span>}
                            <img
                                src={img.preview || img.url}
                                alt={`Ad image ${idx + 1}`}
                                style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }}
                            />
                            <div style={s.imageActions}>
                                {!img.isMain && (
                                    <button
                                        type="button"
                                        onClick={() => setAsMain(img.id)}
                                        style={s.actionBtn('#f97316')}
                                        title="Set as main"
                                    >
                                        ★
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => removeImage(img.id)}
                                    style={s.actionBtn('#ef4444')}
                                    title="Remove"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Video Upload Component ─────────────────────────────────────────────────

function VideoUpload({ videoUrl, videoFile, onUrlChange, onFileChange }) {
    const [preview, setPreview] = useState(videoUrl || (videoFile ? URL.createObjectURL(videoFile) : null));
    const inputRef = useRef(null);

    const handleFile = (file) => {
        if (!file) return;
        if (!file.type.startsWith('video/')) {
            alert('Please upload a valid video file (MP4, WebM, MOV)');
            return;
        }
        if (file.size > 50 * 1024 * 1024) {
            alert('Video size should be less than 50MB');
            return;
        }
        onFileChange(file);
        setPreview(URL.createObjectURL(file));
        onUrlChange('');
    };

    const handleUrlChange = (url) => {
        onUrlChange(url);
        onFileChange(null);
        setPreview(null);
    };

    return (
        <div>
            <div style={s.row}>
                <div style={s.field}>
                    <label style={s.label}>YouTube/Vimeo URL</label>
                    <input
                        value={videoUrl}
                        onChange={e => handleUrlChange(e.target.value)}
                        placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                        style={s.input}
                    />
                    <span style={s.hint}>Paste video link from YouTube or Vimeo</span>
                </div>
                <div style={s.field}>
                    <label style={s.label}>OR Upload Video File</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            style={{
                                padding: '10px 16px',
                                borderRadius: '10px',
                                border: '1.5px solid #e8e8e8',
                                background: '#fafafa',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 600,
                            }}
                        >
                            📁 Choose Video
                        </button>
                        <input
                            ref={inputRef}
                            type="file"
                            accept="video/*"
                            style={{ display: 'none' }}
                            onChange={e => handleFile(e.target.files[0])}
                        />
                        {videoFile && <span style={{ fontSize: '12px', color: '#22a05a' }}>✓ {videoFile.name}</span>}
                    </div>
                    <span style={s.hint}>MP4, WebM, MOV — max 50MB</span>
                </div>
            </div>
            {(preview || videoUrl) && (
                <div style={{ marginTop: '12px', borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
                    <video controls style={{ width: '100%', maxHeight: '200px' }}>
                        <source src={preview || videoUrl} />
                    </video>
                </div>
            )}
        </div>
    );
}

// ─── Native Ad Component ────────────────────────────────────────────────────

function NativeAdFields({ brandName, brandLogo, onBrandNameChange, onBrandLogoChange }) {
    const inputRef = useRef(null);
    const [preview, setPreview] = useState(brandLogo);

    const handleLogoUpload = (file) => {
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target.result);
            onBrandLogoChange(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div style={s.row}>
            <div style={s.field}>
                <label style={s.label}>Brand Name</label>
                <input value={brandName} onChange={e => onBrandNameChange(e.target.value)} placeholder="e.g., Nike, Apple, Amazon" style={s.input} />
                <span style={s.hint}>Company or brand name for native ad</span>
            </div>
            <div style={s.field}>
                <label style={s.label}>Brand Logo</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        style={{
                            padding: '10px 16px',
                            borderRadius: '10px',
                            border: '1.5px solid #e8e8e8',
                            background: '#fafafa',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600,
                        }}
                    >
                        {preview ? '🔄 Change Logo' : '📁 Upload Logo'}
                    </button>
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={e => handleLogoUpload(e.target.files[0])}
                    />
                    {preview && (
                        <img src={preview} alt="Brand logo" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                    )}
                </div>
                <span style={s.hint}>Square logo recommended</span>
            </div>
        </div>
    );
}

// ─── Ad Size Selector Component ───────────────────────────────────────────

function AdSizeSelector({ selectedSize, onSizeChange, placementCategory, onDeviceCategoryChange }) {
    const [sizeError, setSizeError] = useState(null);
    const [imageDimensions, setImageDimensions] = useState(null);

    // All available ad sizes with descriptions
    const ALL_AD_SIZES = [
        // Desktop Sizes
        { width: 728, height: 90, label: 'Leaderboard', description: 'Top of desktop website', category: 'desktop', placement: 'Header, Footer' },
        { width: 970, height: 90, label: 'Large Leaderboard', description: 'Premium desktop header', category: 'desktop', placement: 'Header' },
        { width: 970, height: 250, label: 'Billboard', description: 'High revenue homepage banner', category: 'desktop', placement: 'Homepage Premium' },
        { width: 300, height: 250, label: 'Medium Rectangle', description: 'Inside articles/content', category: 'desktop,mobile', placement: 'Article Middle, Between News Cards' },
        { width: 336, height: 280, label: 'Large Rectangle', description: 'Blog/news article ads', category: 'desktop', placement: 'Article Middle' },
        { width: 160, height: 600, label: 'Wide Skyscraper', description: 'Sidebar desktop ads', category: 'desktop', placement: 'Sidebar' },
        { width: 300, height: 600, label: 'Half Page', description: 'High CPM sidebar ads', category: 'desktop', placement: 'Sidebar' },
        // Mobile Sizes
        { width: 320, height: 50, label: 'Mobile Banner', description: 'Mobile top/bottom', category: 'mobile', placement: 'Top Banner, Sticky Bottom' },
        { width: 320, height: 100, label: 'Large Mobile Banner', description: 'Better mobile revenue', category: 'mobile', placement: 'Top Banner' },
        { width: 300, height: 250, label: 'Mobile Rectangle', description: 'Mobile article ads', category: 'mobile', placement: 'Between News Cards' }
    ];

    // Filter sizes based on placement category
    const getFilteredSizes = () => {
        const desktopPlacements = ['Header', 'Homepage Premium', 'Article Middle', 'Sidebar', 'Footer'];
        const isDesktop = desktopPlacements.includes(placementCategory);

        if (isDesktop) {
            return ALL_AD_SIZES.filter(size => size.category.includes('desktop'));
        } else {
            return ALL_AD_SIZES.filter(size => size.category.includes('mobile'));
        }
    };

    const availableSizes = getFilteredSizes();
    const deviceType = availableSizes[0]?.category === 'desktop' ? 'desktop' : 'mobile';

    // Update device category when placement changes
    useEffect(() => {
        if (onDeviceCategoryChange) {
            onDeviceCategoryChange(deviceType);
        }
    }, [deviceType, onDeviceCategoryChange]);

    const handleSizeChange = (e) => {
        const selectedValue = e.target.value;
        if (selectedValue) {
            const size = JSON.parse(selectedValue);
            onSizeChange(size);
            setSizeError(null);
            setImageDimensions(null);
        }
    };

    const getSelectedValue = () => {
        if (selectedSize) {
            return JSON.stringify({
                width: selectedSize.width,
                height: selectedSize.height,
                label: selectedSize.label,
                description: selectedSize.description
            });
        }
        return '';
    };

    const dropdownStyle = {
        width: '100%',
        padding: '12px 14px',
        borderRadius: '10px',
        border: '1.5px solid #e8e8e8',
        background: '#fafafa',
        fontSize: '14px',
        color: '#111',
        cursor: 'pointer',
        outline: 'none',
        fontFamily: 'inherit'
    };

    const infoBoxStyle = {
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '12px',
        padding: '12px 16px',
        fontSize: '13px',
        color: '#1e40af',
        marginTop: '12px'
    };

    const errorBoxStyle = {
        background: '#fffbeb',
        border: '1px solid #fde68a',
        borderRadius: '12px',
        padding: '12px 16px',
        fontSize: '13px',
        color: '#92400e',
        marginTop: '12px'
    };

    return (
        <div style={{ marginBottom: '16px' }}>
            <label style={s.label}>Ad Size *</label>
            <select
                value={getSelectedValue()}
                onChange={handleSizeChange}
                style={dropdownStyle}
                onFocus={(e) => (e.target.style.borderColor = '#f97316')}
                onBlur={(e) => (e.target.style.borderColor = '#e8e8e8')}
            >
                <option value="">Select ad size...</option>
                {availableSizes.map((size, index) => (
                    <option
                        key={`${size.width}x${size.height}-${index}`}
                        value={JSON.stringify(size)}
                    >
                        {size.label} — {size.width}×{size.height}px ({size.description})
                    </option>
                ))}
            </select>
            <span style={s.hint}>Select the ad size based on placement location</span>

            {selectedSize && (
                <div style={infoBoxStyle}>
                    <strong>📐 Selected: {selectedSize.label} ({selectedSize.width}×{selectedSize.height}px)</strong>
                    <br />
                    <span style={{ fontSize: '12px', marginTop: '4px', display: 'block' }}>
                        Best for: {selectedSize.description}
                    </span>
                    {selectedSize.placement && (
                        <span style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                            Recommended placements: {selectedSize.placement}
                        </span>
                    )}
                    {imageDimensions && (
                        <span style={{ display: 'block', marginTop: '8px', color: sizeError ? '#dc2626' : '#22a05a' }}>
                            Uploaded image: {imageDimensions.width}×{imageDimensions.height}px
                            {sizeError && <span style={{ display: 'block', marginTop: '4px' }}>⚠️ {sizeError}</span>}
                        </span>
                    )}
                </div>
            )}

            {sizeError && (
                <div style={errorBoxStyle}>
                    ⚠️ {sizeError}. Please upload an image with the correct dimensions.
                </div>
            )}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdvertisementForm({ isOpen, onClose, onSubmit, editingAd }) {
    const [formData, setFormData] = useState(defaultForm());
    const [showRotation, setShowRotation] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [showTimerSettings, setShowTimerSettings] = useState(false);
    const [showSlotSettings, setShowSlotSettings] = useState(false);
    const [selectedSize, setSelectedSize] = useState(editingAd?.adSize || null);
    const [deviceCategory, setDeviceCategory] = useState(editingAd?.deviceCategory || 'both');

    useEffect(() => {
        if (!isOpen) return;
        if (editingAd) {
            setFormData({
                ...defaultForm(),
                ...editingAd,
                budget: editingAd.budget ? editingAd.budget / 100 : 0,
                costPerUnit: editingAd.costPerUnit ? editingAd.costPerUnit / 100 : 0,
                images: editingAd.images || [],
                videoUrl: editingAd.videoUrl || '',
                brandName: editingAd.brandName || '',
                brandLogo: editingAd.brandLogo || '',
                adSize: editingAd.adSize || null,
                deviceCategory: editingAd.deviceCategory || 'both',
                displayDuration: editingAd.displayDuration || null,
                autoHide: editingAd.autoHide || false,
                autoClosePopup: editingAd.autoClosePopup !== undefined ? editingAd.autoClosePopup : true,
                adSlot1Enabled: editingAd.adSlot1Enabled || false,
                adSlot2Enabled: editingAd.adSlot2Enabled || false,
            });
            setSelectedSize(editingAd.adSize || null);
            setDeviceCategory(editingAd.deviceCategory || 'both');
        } else {
            setFormData(defaultForm());
            setSelectedSize(null);
            setDeviceCategory('both');
        }
    }, [editingAd, isOpen]);

    if (!isOpen) return null;

    const set = (field, value) =>
        setFormData(prev => {
            const next = { ...prev, [field]: value };
            if (field === 'placementCategory') {
                next.placementPosition = POSITION_CATEGORIES[value]?.[0] ?? '';
                setSelectedSize(null);
            }
            if (field === 'pricingModel') next.costPerUnit = 0;
            return next;
        });

    const positions = POSITION_CATEGORIES[formData.placementCategory] ?? [];

    const isDisabled = () => {
        if (!formData.title) return true;
        if (formData.budget <= 0) return true;
        if (formData.pricingModel !== 'fixed' && formData.costPerUnit <= 0) return true;
        if (formData.type === 'banner' && !selectedSize) return true;

        switch (formData.type) {
            case 'banner':
                return formData.images.length === 0;
            case 'video':
                return !formData.videoUrl && !formData.videoFile;
            case 'popup':
                return formData.images.length === 0;
            case 'native':
                return formData.images.length === 0 || !formData.brandName || !formData.brandLogo;
            default:
                return true;
        }
    };

    const handleSubmit = () => {
        const imageFiles = formData.images
            .filter(img => img.file instanceof File)
            .map(img => img.file);

        const submitData = {
            title: formData.title,
            description: formData.description,
            type: formData.type,
            linkUrl: formData.linkUrl,
            placementCategory: formData.placementCategory,
            placementPosition: formData.placementPosition,
            targetPages: formData.targetPages,
            targetDevices: formData.targetDevices,
            targetAudiences: formData.targetAudiences,
            targetLocations: formData.targetLocations,
            targetBehaviors: formData.targetBehaviors,
            targetTimeOfDay: formData.targetTimeOfDay,
            startDate: formData.startDate,
            endDate: formData.endDate,
            pricingModel: formData.pricingModel,
            budget: Math.round(formData.budget * 100),
            costPerUnit: Math.round(formData.costPerUnit * 100),
            rotationMethod: formData.rotationMethod,
            rotationWeight: formData.rotationWeight,
            isPartOfRotation: formData.isPartOfRotation,
            frequencyCap: formData.frequencyCap,
            frequencyCapInterval: formData.frequencyCapInterval,
            brandName: formData.brandName,
            brandLogo: formData.brandLogo,
            videoUrl: formData.videoUrl,
            adSize: selectedSize,
            deviceCategory: deviceCategory,
            displayDuration: formData.displayDuration,
            autoHide: formData.autoHide,
            autoClosePopup: formData.autoClosePopup,
            adSlot1Enabled: formData.adSlot1Enabled,
            adSlot2Enabled: formData.adSlot2Enabled,
        };

        onSubmit(submitData, imageFiles, formData.videoFile);
        onClose();
    };

    const estClicks = formData.costPerUnit > 0
        ? Math.floor(formData.budget / formData.costPerUnit)
        : 0;
    const estImpressions = formData.costPerUnit > 0
        ? Math.floor((formData.budget / formData.costPerUnit) * 1000)
        : 0;

    const costLabel = { cpc: 'Cost Per Click (₹)', cpm: 'Cost Per 1,000 Impressions (₹)', fixed: 'Campaign Cost (₹)' };
    const budgetLabel = { cpc: 'Total Budget — clicks (₹)', cpm: 'Total Budget — impressions (₹)', fixed: 'Campaign Budget (₹)' };

    const timeSlots = ['Morning (6–12)', 'Afternoon (12–17)', 'Evening (17–21)', 'Night (21-6)'];

    const adTypes = [
        { value: 'banner', label: 'Banner', icon: '🖼️', description: 'Standard image banner ad' },
        { value: 'video', label: 'Video', icon: '📹', description: 'Video advertisement' },
        { value: 'popup', label: 'Popup', icon: '🪟', description: 'Modal/popup overlay ad' },
        { value: 'native', label: 'Native', icon: '📰', description: 'Native ad with brand info' },
    ];

    return (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={s.modal}>
                <div style={s.header}>
                    <div>
                        <p style={s.headerTitle}>{editingAd ? 'Edit Advertisement' : 'Create New Advertisement'}</p>
                        <p style={s.headerSub}>Set up targeting, placement, budget and rotation rules. All ads require approval.</p>
                    </div>
                    <button style={s.closeBtn} onClick={onClose} aria-label="Close">✕</button>
                </div>

                <div style={s.body}>
                    {/* Creative Details Section */}
                    <div style={s.section}>
                        <div style={s.sectionHeader}>
                            <span style={s.sectionTitle}>Creative Details</span>
                        </div>

                        <div style={s.row}>
                            <div style={s.field}>
                                <label style={s.label}>Title *</label>
                                <input value={formData.title} onChange={e => set('title', e.target.value)} placeholder="Summer Sale Campaign" style={s.input} />
                            </div>
                        </div>

                        <div style={s.field}>
                            <label style={s.label}>Ad Type *</label>
                            <div style={s.typeSelector}>
                                {adTypes.map(type => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        style={s.typeOption(formData.type === type.value)}
                                        onClick={() => set('type', type.value)}
                                    >
                                        <span style={s.typeIcon}>{type.icon}</span>
                                        <span>{type.label}</span>
                                        <span style={{ fontSize: '10px', fontWeight: 'normal', color: '#888' }}>{type.description}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={s.rowFull}>
                            <div style={s.field}>
                                <label style={s.label}>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => set('description', e.target.value)}
                                    placeholder="Briefly describe your campaign goal…"
                                    rows={3}
                                    style={s.textarea}
                                />
                            </div>
                        </div>

                        <div style={s.rowFull}>
                            {formData.type === 'banner' && (
                                <div style={s.field}>
                                    <label style={s.label}>Ad Images *</label>
                                    <MultipleImageUpload
                                        images={formData.images}
                                        onChange={v => set('images', v)}
                                        maxImages={10}
                                    />
                                </div>
                            )}

                            {formData.type === 'video' && (
                                <div style={s.field}>
                                    <label style={s.label}>Video Asset *</label>
                                    <VideoUpload
                                        videoUrl={formData.videoUrl}
                                        videoFile={formData.videoFile}
                                        onUrlChange={v => set('videoUrl', v)}
                                        onFileChange={v => set('videoFile', v)}
                                    />
                                </div>
                            )}

                            {formData.type === 'popup' && (
                                <>
                                    <div style={s.field}>
                                        <label style={s.label}>Popup Images *</label>
                                        <MultipleImageUpload
                                            images={formData.images}
                                            onChange={v => set('images', v)}
                                            maxImages={5}
                                        />
                                    </div>
                                    <div style={{ ...s.infoBox('amber'), marginTop: '8px' }}>
                                        💡 Popup ads will appear as modal overlays. You can add multiple images for carousel popups.
                                    </div>
                                </>
                            )}

                            {formData.type === 'native' && (
                                <>
                                    <div style={s.field}>
                                        <label style={s.label}>Ad Images *</label>
                                        <MultipleImageUpload
                                            images={formData.images}
                                            onChange={v => set('images', v)}
                                            maxImages={5}
                                        />
                                    </div>
                                    <NativeAdFields
                                        brandName={formData.brandName}
                                        brandLogo={formData.brandLogo}
                                        onBrandNameChange={v => set('brandName', v)}
                                        onBrandLogoChange={v => set('brandLogo', v)}
                                    />
                                </>
                            )}
                        </div>

                        <div style={s.rowFull}>
                            <div style={s.field}>
                                <label style={s.label}>Destination Link</label>
                                <input value={formData.linkUrl} onChange={e => set('linkUrl', e.target.value)} placeholder="https://example.com/landing" style={s.input} />
                            </div>
                        </div>
                    </div>

                    <div style={s.divider} />

                    {/* Position Mapping Section */}
                    <div style={s.section}>
                        <div style={s.sectionHeader}>
                            <span style={s.sectionTitle}>📍 Position Mapping</span>
                        </div>

                        <div style={s.row}>
                            <div style={s.field}>
                                <label style={s.label}>Layout Section *</label>
                                <select
                                    value={formData.placementCategory}
                                    onChange={e => set('placementCategory', e.target.value)}
                                    style={s.select}
                                >
                                    {Object.keys(POSITION_CATEGORIES).map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={s.field}>
                                <label style={s.label}>Specific Position *</label>
                                <select
                                    value={formData.placementPosition}
                                    onChange={e => set('placementPosition', e.target.value)}
                                    style={s.select}
                                >
                                    {positions.map(pos => (
                                        <option key={pos} value={pos}>{pos}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={s.row}>
                            <div style={s.field}>
                                <label style={s.label}>Target Devices</label>
                                <select
                                    value={formData.targetDevices.join(',')}
                                    onChange={e => set('targetDevices', e.target.value.split(','))}
                                    style={s.select}
                                >
                                    <option value="desktop">Desktop Only</option>
                                    <option value="desktop,mobile">Desktop + Mobile</option>
                                    <option value="mobile">Mobile Only</option>
                                    <option value="tablet">Tablet Only</option>
                                    <option value="desktop,mobile,tablet">All Devices</option>
                                </select>
                            </div>
                            <div />
                        </div>

                        {/* Ad Size Selection */}
                        <div style={s.rowFull}>
                            <AdSizeSelector
                                selectedSize={selectedSize}
                                onSizeChange={(size) => {
                                    setSelectedSize(size);
                                    set('adSize', size);
                                    const isDesktopSize = size.category === 'desktop';
                                    const deviceCat = isDesktopSize ? 'desktop' : 'mobile';
                                    setDeviceCategory(deviceCat);
                                    set('deviceCategory', deviceCat);
                                }}
                                placementCategory={formData.placementCategory}
                                onDeviceCategoryChange={(deviceType) => {
                                    setDeviceCategory(deviceType);
                                    set('deviceCategory', deviceType);
                                }}
                            />
                        </div>

                        <div style={{ ...s.infoBox('blue'), display: 'flex', gap: '8px' }}>
                            <span>💡</span>
                            <span>
                                Your {formData.type} ad will appear in the <strong>{formData.placementCategory}</strong> section
                                {' '}at <strong>{formData.placementPosition}</strong> position.
                            </span>
                        </div>
                    </div>

                    <div style={s.divider} />

                    {/* Schedule Section */}
                    <div style={s.section}>
                        <div style={s.sectionHeader}>
                            <span style={s.sectionTitle}>📅 Schedule</span>
                        </div>
                        <div style={s.row}>
                            <div style={s.field}>
                                <label style={s.label}>Start Date</label>
                                <input type="date" value={formData.startDate} onChange={e => set('startDate', e.target.value)} style={s.input} />
                            </div>
                            <div style={s.field}>
                                <label style={s.label}>End Date</label>
                                <input type="date" value={formData.endDate} onChange={e => set('endDate', e.target.value)} style={s.input} />
                            </div>
                        </div>
                    </div>

                    <div style={s.divider} />

                    {/* Pricing & Budget Section */}
                    <div style={s.section}>
                        <div style={s.sectionHeader}>
                            <span style={s.sectionTitle}>💰 Pricing & Budget</span>
                        </div>

                        <div style={s.row3}>
                            <div style={s.field}>
                                <label style={s.label}>Pricing Model *</label>
                                <select
                                    value={formData.pricingModel}
                                    onChange={e => set('pricingModel', e.target.value)}
                                    style={s.select}
                                >
                                    <option value="cpc">Cost Per Click (CPC)</option>
                                    <option value="cpm">Cost Per Mille (CPM)</option>
                                    <option value="fixed">Fixed Campaign</option>
                                </select>
                            </div>
                            <div style={s.field}>
                                <label style={s.label}>{costLabel[formData.pricingModel]} *</label>
                                <input
                                    type="number" min="0" step="0.01"
                                    value={formData.costPerUnit}
                                    onChange={e => set('costPerUnit', parseFloat(e.target.value) || 0)}
                                    placeholder={formData.pricingModel === 'cpc' ? '0.50' : formData.pricingModel === 'cpm' ? '5.00' : '500.00'}
                                    style={s.input}
                                />
                            </div>
                            <div style={s.field}>
                                <label style={s.label}>{budgetLabel[formData.pricingModel]} *</label>
                                <input
                                    type="number" min="0" step="0.01"
                                    value={formData.budget}
                                    onChange={e => set('budget', parseFloat(e.target.value) || 0)}
                                    placeholder="Enter total budget"
                                    style={s.input}
                                />
                            </div>
                        </div>

                        {(formData.budget > 0 || formData.costPerUnit > 0) && (
                            <div style={s.summaryCard}>
                                <p style={{ fontSize: '12px', fontWeight: 700, color: '#888', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pricing Summary</p>
                                <div style={s.summaryRow}>
                                    <span style={{ color: '#666' }}>Pricing Model</span>
                                    <span style={{ fontWeight: 600, color: '#222' }}>
                                        {{ cpc: 'Cost Per Click', cpm: 'Cost Per Mille', fixed: 'Fixed Campaign' }[formData.pricingModel]}
                                    </span>
                                </div>
                                <div style={s.summaryRow}>
                                    <span style={{ color: '#666' }}>{costLabel[formData.pricingModel]}</span>
                                    <span style={{ fontWeight: 600 }}>₹{Number(formData.costPerUnit).toFixed(2)}</span>
                                </div>
                                <div style={{ ...s.summaryRow, borderTop: '1px solid #e5e7eb', paddingTop: '8px', marginTop: '4px' }}>
                                    <span style={{ color: '#666' }}>Total Budget</span>
                                    <span style={{ fontWeight: 700, color: '#f97316' }}>₹{Number(formData.budget).toFixed(2)}</span>
                                </div>
                                {formData.pricingModel !== 'fixed' && formData.costPerUnit > 0 && (
                                    <div style={s.summaryRow}>
                                        <span style={{ color: '#666' }}>
                                            {formData.pricingModel === 'cpc' ? 'Estimated Clicks' : 'Estimated Impressions'}
                                        </span>
                                        <span style={{ fontWeight: 700, color: '#22a05a' }}>
                                            {formData.pricingModel === 'cpc'
                                                ? estClicks.toLocaleString()
                                                : estImpressions.toLocaleString()
                                            }
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div style={s.divider} />

                    {/* Rotation Settings Toggle */}
                    <div style={s.toggleSection}>
                        <button type="button" style={s.toggleHeader} onClick={() => setShowRotation(v => !v)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '16px' }}>🔄</span>
                                <span style={{ fontWeight: 700, fontSize: '14px', color: '#222' }}>Rotation Settings</span>
                                <span style={s.badge(formData.isPartOfRotation ? 'green' : 'gray')}>
                                    {formData.isPartOfRotation ? 'Enabled' : 'Disabled'}
                                </span>
                            </div>
                            <span style={{ fontSize: '12px', color: '#bbb', transform: showRotation ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block', transition: 'transform 0.2s' }}>▼</span>
                        </button>
                        {showRotation && (
                            <div style={s.toggleBody}>
                                <div style={s.checkRow}>
                                    <input
                                        type="checkbox"
                                        id="isPartOfRotation"
                                        checked={formData.isPartOfRotation}
                                        onChange={e => set('isPartOfRotation', e.target.checked)}
                                        style={{ width: '16px', height: '16px', accentColor: '#f97316' }}
                                    />
                                    <label htmlFor="isPartOfRotation" style={{ fontSize: '14px', color: '#333', cursor: 'pointer' }}>
                                        Enable rotation with other ads in the same position
                                    </label>
                                </div>

                                {formData.isPartOfRotation && (
                                    <>
                                        <div style={s.row}>
                                            <div style={s.field}>
                                                <label style={s.label}>Rotation Method</label>
                                                <select
                                                    value={formData.rotationMethod}
                                                    onChange={e => set('rotationMethod', e.target.value)}
                                                    style={s.select}
                                                >
                                                    {ROTATION_METHODS.map(m => (
                                                        <option key={m.value} value={m.value}>{m.label} — {m.description}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            {formData.rotationMethod === 'weighted' && (
                                                <div style={s.field}>
                                                    <label style={s.label}>Rotation Weight (%)</label>
                                                    <input
                                                        type="number" min="0" max="100" step="1"
                                                        value={formData.rotationWeight}
                                                        onChange={e => set('rotationWeight', parseInt(e.target.value) || 0)}
                                                        style={s.input}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ ...s.infoBox('amber'), display: 'flex', gap: '8px' }}>
                                            <span>🔄</span>
                                            <span>
                                                <strong>Rotation active</strong> using <strong>{ROTATION_METHODS.find(m => m.value === formData.rotationMethod)?.label}</strong>.
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Advanced Targeting Toggle */}
                    <div style={s.toggleSection}>
                        <button type="button" style={s.toggleHeader} onClick={() => setShowAdvanced(v => !v)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '16px' }}>🎯</span>
                                <span style={{ fontWeight: 700, fontSize: '14px', color: '#222' }}>Advanced Targeting</span>
                            </div>
                            <span style={{ fontSize: '12px', color: '#bbb', transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block', transition: 'transform 0.2s' }}>▼</span>
                        </button>
                        {showAdvanced && (
                            <div style={s.toggleBody}>
                                <div style={s.row}>
                                    <div style={s.field}>
                                        <label style={s.label}>Frequency Cap (max impressions per user)</label>
                                        <input
                                            type="number" min="0" placeholder="e.g. 5"
                                            value={formData.frequencyCap ?? ''}
                                            onChange={e => set('frequencyCap', e.target.value ? parseInt(e.target.value) : null)}
                                            style={s.input}
                                        />
                                    </div>
                                    <div style={s.field}>
                                        <label style={s.label}>Cap Interval</label>
                                        <select
                                            value={formData.frequencyCapInterval}
                                            onChange={e => set('frequencyCapInterval', e.target.value)}
                                            style={s.select}
                                        >
                                            <option value="day">Per Day</option>
                                            <option value="week">Per Week</option>
                                            <option value="month">Per Month</option>
                                            <option value="total">Total Campaign</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={s.field}>
                                    <label style={s.label}>Time of Day Targeting</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                                        {timeSlots.map(t => (
                                            <button
                                                key={t} type="button"
                                                style={s.pillBtn(formData.targetTimeOfDay.includes(t))}
                                                onClick={() => {
                                                    const cur = formData.targetTimeOfDay;
                                                    set('targetTimeOfDay', cur.includes(t) ? cur.filter(x => x !== t) : [...cur, t]);
                                                }}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Display Timer Settings Toggle */}
                    <div style={s.toggleSection}>
                        <button type="button" style={s.toggleHeader} onClick={() => setShowTimerSettings(v => !v)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '16px' }}>⏱️</span>
                                <span style={{ fontWeight: 700, fontSize: '14px', color: '#222' }}>Display Timer Settings</span>
                                <span style={s.badge(formData.autoHide ? 'green' : 'gray')}>
                                    {formData.autoHide ? 'Auto-Hide ON' : 'Auto-Hide OFF'}
                                </span>
                            </div>
                            <span style={{ fontSize: '12px', color: '#bbb', transform: showTimerSettings ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block', transition: 'transform 0.2s' }}>▼</span>
                        </button>
                        {showTimerSettings && (
                            <div style={s.toggleBody}>
                                <div style={s.checkRow}>
                                    <input
                                        type="checkbox"
                                        id="autoHide"
                                        checked={formData.autoHide}
                                        onChange={e => set('autoHide', e.target.checked)}
                                        style={{ width: '16px', height: '16px', accentColor: '#f97316' }}
                                    />
                                    <label htmlFor="autoHide" style={{ fontSize: '14px', color: '#333', cursor: 'pointer' }}>
                                        Auto-hide ad after specified duration
                                    </label>
                                </div>

                                {formData.autoHide && (
                                    <div style={s.row}>
                                        <div style={s.field}>
                                            <label style={s.label}>Display Duration (seconds)</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="300"
                                                step="1"
                                                value={formData.displayDuration || ''}
                                                onChange={e => set('displayDuration', parseInt(e.target.value) || null)}
                                                placeholder="e.g., 120 for 2 minutes"
                                                style={s.input}
                                            />
                                            <span style={s.hint}>How long the ad should stay visible (1-300 seconds)</span>
                                        </div>
                                        {formData.type === 'popup' && (
                                            <div style={s.field}>
                                                <label style={s.label}>Auto-Close Popup</label>
                                                <select
                                                    value={formData.autoClosePopup ? 'true' : 'false'}
                                                    onChange={e => set('autoClosePopup', e.target.value === 'true')}
                                                    style={s.select}
                                                >
                                                    <option value="true">Yes - Auto close after duration</option>
                                                    <option value="false">No - User must close manually</option>
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {formData.autoHide && formData.displayDuration && (
                                    <div style={{ ...s.infoBox('blue'), marginTop: '8px', fontSize: '12px' }}>
                                        ⏱️ This ad will automatically hide/close after {Math.floor(formData.displayDuration / 60)} minute(s) and {formData.displayDuration % 60} second(s).
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* NEW: Ad Slot Assignment Section */}
                    <div style={s.toggleSection}>
                        <button type="button" style={s.toggleHeader} onClick={() => setShowSlotSettings(v => !v)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '16px' }}>📌</span>
                                <span style={{ fontWeight: 700, fontSize: '14px', color: '#222' }}>Ad Slot Assignment</span>
                                <span style={s.badge(formData.adSlot1Enabled || formData.adSlot2Enabled ? 'green' : 'gray')}>
                                    {formData.adSlot1Enabled && formData.adSlot2Enabled ? 'Both Slots' :
                                        formData.adSlot1Enabled ? 'Slot 1 Only' :
                                            formData.adSlot2Enabled ? 'Slot 2 Only' : 'No Slot'}
                                </span>
                            </div>
                            <span style={{ fontSize: '12px', color: '#bbb', transform: showSlotSettings ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block', transition: 'transform 0.2s' }}>▼</span>
                        </button>
                        {showSlotSettings && (
                            <div style={s.toggleBody}>
                                <div style={s.checkRow}>
                                    <input
                                        type="checkbox"
                                        id="adSlot1Enabled"
                                        checked={formData.adSlot1Enabled}
                                        onChange={e => set('adSlot1Enabled', e.target.checked)}
                                        style={{ width: '16px', height: '16px', accentColor: '#f97316' }}
                                    />
                                    <label htmlFor="adSlot1Enabled" style={{ fontSize: '14px', color: '#333', cursor: 'pointer' }}>
                                        Show in <strong>Ad Slot 1</strong>
                                    </label>
                                </div>

                                <div style={s.checkRow}>
                                    <input
                                        type="checkbox"
                                        id="adSlot2Enabled"
                                        checked={formData.adSlot2Enabled}
                                        onChange={e => set('adSlot2Enabled', e.target.checked)}
                                        style={{ width: '16px', height: '16px', accentColor: '#f97316' }}
                                    />
                                    <label htmlFor="adSlot2Enabled" style={{ fontSize: '14px', color: '#333', cursor: 'pointer' }}>
                                        Show in <strong>Ad Slot 2</strong>
                                    </label>
                                </div>

                                {(formData.adSlot1Enabled || formData.adSlot2Enabled) && (
                                    <div style={{ ...s.infoBox('blue'), marginTop: '12px', fontSize: '12px' }}>
                                        ✅ This ad will appear in: {formData.adSlot1Enabled ? 'Slot 1' : ''} {formData.adSlot1Enabled && formData.adSlot2Enabled ? '&' : ''} {formData.adSlot2Enabled ? 'Slot 2' : ''}
                                    </div>
                                )}

                                {(formData.adSlot1Enabled || formData.adSlot2Enabled) && (
                                    <div style={{ ...s.infoBox('blue'), marginTop: '12px', fontSize: '12px' }}>
                                        ✅ This ad will appear in: {formData.adSlot1Enabled ? 'Slot 1' : ''} {formData.adSlot1Enabled && formData.adSlot2Enabled ? '&' : ''} {formData.adSlot2Enabled ? 'Slot 2' : ''}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div style={s.footer}>
                    <button style={s.btnOutline} onClick={onClose}>Cancel</button>
                    <button style={s.btnPrimary(isDisabled())} onClick={handleSubmit} disabled={isDisabled()}>
                        {editingAd ? '✓  Update & Submit for Approval' : '✓  Create & Submit for Approval'}
                    </button>
                </div>
            </div>
        </div>
    );
}