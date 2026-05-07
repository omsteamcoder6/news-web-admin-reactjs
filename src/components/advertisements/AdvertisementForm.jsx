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
    'Popup': ['On Load', 'On Scroll', 'On Exit Intent', 'On Click', 'Timed Popup'],
    'Floating': ['Corner Widget', 'Sticky Bottom', 'Slide-in Left', 'Slide-in Right'],
    'Interstitial': ['Full Screen', 'Between Pages']
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
    frequencyCapInterval: 'day'
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

// ─── Multiple Image Upload Component (FIXED) ─────────────────────────────────────────

function MultipleImageUpload({ images = [], onChange, maxImages = 10 }) {
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef(null);

    const handleFile = (file) => {
        if (!file || !file.type.startsWith('image/')) return;
        if (images.length >= maxImages) {
            alert(`Maximum ${maxImages} images allowed`);
            return;
        }
        
        // FIX: Store actual File object, NOT Base64
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
                <Field label="YouTube/Vimeo URL" hint="Paste video link from YouTube or Vimeo">
                    <Inp
                        value={videoUrl}
                        onChange={handleUrlChange}
                        placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                    />
                </Field>
                <Field label="OR Upload Video File" hint="MP4, WebM, MOV — max 50MB">
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
                </Field>
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
            <Field label="Brand Name" hint="Company or brand name for native ad">
                <Inp value={brandName} onChange={onBrandNameChange} placeholder="e.g., Nike, Apple, Amazon" />
            </Field>
            <Field label="Brand Logo" hint="Square logo recommended">
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
            </Field>
        </div>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({ label, hint, children }) {
    return (
        <div style={s.field}>
            {label && <label style={s.label}>{label}</label>}
            {children}
            {hint && <span style={s.hint}>{hint}</span>}
        </div>
    );
}

function Inp({ value, onChange, ...rest }) {
    return (
        <input
            value={value}
            onChange={e => onChange(e.target.value)}
            style={s.input}
            onFocus={e => (e.target.style.borderColor = '#f97316')}
            onBlur={e => (e.target.style.borderColor = '#e8e8e8')}
            {...rest}
        />
    );
}

function Sel({ value, onChange, options }) {
    return (
        <select
            value={value}
            onChange={e => onChange(e.target.value)}
            style={s.select}
            onFocus={e => (e.target.style.borderColor = '#f97316')}
            onBlur={e => (e.target.style.borderColor = '#e8e8e8')}
        >
            {options.map(opt =>
                typeof opt === 'string'
                    ? <option key={opt} value={opt}>{opt}</option>
                    : <option key={opt.value} value={opt.value}>{opt.label}</option>
            )}
        </select>
    );
}

function ToggleSection({ icon, title, badge, badgeColor, isOpen, onToggle, children }) {
    return (
        <div style={s.toggleSection}>
            <button type="button" style={s.toggleHeader} onClick={onToggle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '16px' }}>{icon}</span>
                    <span style={{ fontWeight: 700, fontSize: '14px', color: '#222' }}>{title}</span>
                    {badge && <span style={s.badge(badgeColor)}>{badge}</span>}
                </div>
                <span style={{ fontSize: '12px', color: '#bbb', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block', transition: 'transform 0.2s' }}>▼</span>
            </button>
            {isOpen && <div style={s.toggleBody}>{children}</div>}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdvertisementForm({ isOpen, onClose, onSubmit, editingAd }) {
    const [formData, setFormData] = useState(defaultForm());
    const [showRotation, setShowRotation] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

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
            });
        } else {
            setFormData(defaultForm());
        }
    }, [editingAd, isOpen]);

    if (!isOpen) return null;

    const set = (field, value) =>
        setFormData(prev => {
            const next = { ...prev, [field]: value };
            if (field === 'placementCategory') {
                next.placementPosition = POSITION_CATEGORIES[value]?.[0] ?? '';
            }
            if (field === 'pricingModel') next.costPerUnit = 0;
            return next;
        });

    const positions = POSITION_CATEGORIES[formData.placementCategory] ?? [];

    const isDisabled = () => {
        if (!formData.title) return true;
        if (formData.budget <= 0) return true;
        if (formData.pricingModel !== 'fixed' && formData.costPerUnit <= 0) return true;
        
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

    // FIXED: handleSubmit - extract File objects properly
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
                    <div style={s.section}>
                        <div style={s.sectionHeader}>
                            <span style={s.sectionTitle}>Creative Details</span>
                        </div>

                        <div style={s.row}>
                            <Field label="Title *">
                                <Inp value={formData.title} onChange={v => set('title', v)} placeholder="Summer Sale Campaign" />
                            </Field>
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
                            <Field label="Description">
                                <textarea
                                    value={formData.description}
                                    onChange={e => set('description', e.target.value)}
                                    placeholder="Briefly describe your campaign goal…"
                                    rows={3}
                                    style={s.textarea}
                                    onFocus={e => (e.target.style.borderColor = '#f97316')}
                                    onBlur={e => (e.target.style.borderColor = '#e8e8e8')}
                                />
                            </Field>
                        </div>

                        <div style={s.rowFull}>
                            {formData.type === 'banner' && (
                                <Field label="Ad Images *" hint="Upload multiple banner images. Drag to reorder. First image will be main.">
                                    <MultipleImageUpload
                                        images={formData.images}
                                        onChange={v => set('images', v)}
                                        maxImages={10}
                                    />
                                </Field>
                            )}

                            {formData.type === 'video' && (
                                <Field label="Video Asset *" hint="Provide a video URL or upload a video file">
                                    <VideoUpload
                                        videoUrl={formData.videoUrl}
                                        videoFile={formData.videoFile}
                                        onUrlChange={v => set('videoUrl', v)}
                                        onFileChange={v => set('videoFile', v)}
                                    />
                                </Field>
                            )}

                            {formData.type === 'popup' && (
                                <>
                                    <Field label="Popup Images *" hint="Upload images for popup ad. First image is main.">
                                        <MultipleImageUpload
                                            images={formData.images}
                                            onChange={v => set('images', v)}
                                            maxImages={5}
                                        />
                                    </Field>
                                    <div style={{ ...s.infoBox('amber'), marginTop: '8px' }}>
                                        💡 Popup ads will appear as modal overlays. You can add multiple images for carousel popups.
                                    </div>
                                </>
                            )}

                            {formData.type === 'native' && (
                                <>
                                    <Field label="Ad Images *" hint="Upload main image for native ad">
                                        <MultipleImageUpload
                                            images={formData.images}
                                            onChange={v => set('images', v)}
                                            maxImages={5}
                                        />
                                    </Field>
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
                            <Field label="Destination Link">
                                <Inp value={formData.linkUrl} onChange={v => set('linkUrl', v)} placeholder="https://example.com/landing" />
                            </Field>
                        </div>
                    </div>

                    <div style={s.divider} />

                    <div style={s.section}>
                        <div style={s.sectionHeader}>
                            <span style={s.sectionTitle}>📍 Position Mapping</span>
                        </div>

                        <div style={s.row}>
                            <Field label="Layout Section *" hint="Select which region of your website">
                                <Sel
                                    value={formData.placementCategory}
                                    onChange={v => set('placementCategory', v)}
                                    options={Object.keys(POSITION_CATEGORIES)}
                                />
                            </Field>
                            <Field label="Specific Position *" hint="Exact location within the section">
                                <Sel
                                    value={formData.placementPosition}
                                    onChange={v => set('placementPosition', v)}
                                    options={positions}
                                />
                            </Field>
                        </div>

                        <div style={s.row}>
                            <Field label="Target Devices">
                                <Sel
                                    value={formData.targetDevices.join(',')}
                                    onChange={v => set('targetDevices', v.split(','))}
                                    options={[
                                        { value: 'desktop', label: 'Desktop Only' },
                                        { value: 'desktop,mobile', label: 'Desktop + Mobile' },
                                        { value: 'mobile', label: 'Mobile Only' },
                                        { value: 'tablet', label: 'Tablet Only' },
                                        { value: 'desktop,mobile,tablet', label: 'All Devices' },
                                    ]}
                                />
                            </Field>
                            <div />
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

                    <div style={s.section}>
                        <div style={s.sectionHeader}>
                            <span style={s.sectionTitle}>📅 Schedule</span>
                        </div>
                        <div style={s.row}>
                            <Field label="Start Date">
                                <Inp type="date" value={formData.startDate} onChange={v => set('startDate', v)} />
                            </Field>
                            <Field label="End Date">
                                <Inp type="date" value={formData.endDate} onChange={v => set('endDate', v)} />
                            </Field>
                        </div>
                    </div>

                    <div style={s.divider} />

                    <div style={s.section}>
                        <div style={s.sectionHeader}>
                            <span style={s.sectionTitle}>💰 Pricing & Budget</span>
                        </div>

                        <div style={s.row3}>
                            <Field label="Pricing Model *">
                                <Sel
                                    value={formData.pricingModel}
                                    onChange={v => set('pricingModel', v)}
                                    options={[
                                        { value: 'cpc', label: 'Cost Per Click (CPC)' },
                                        { value: 'cpm', label: 'Cost Per Mille (CPM)' },
                                        { value: 'fixed', label: 'Fixed Campaign' },
                                    ]}
                                />
                            </Field>
                            <Field label={costLabel[formData.pricingModel] + ' *'}>
                                <Inp
                                    type="number" min="0" step="0.01"
                                    value={formData.costPerUnit}
                                    onChange={v => set('costPerUnit', parseFloat(v) || 0)}
                                    placeholder={formData.pricingModel === 'cpc' ? '0.50' : formData.pricingModel === 'cpm' ? '5.00' : '500.00'}
                                />
                            </Field>
                            <Field label={budgetLabel[formData.pricingModel] + ' *'}>
                                <Inp
                                    type="number" min="0" step="0.01"
                                    value={formData.budget}
                                    onChange={v => set('budget', parseFloat(v) || 0)}
                                    placeholder="Enter total budget"
                                />
                            </Field>
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

                    <ToggleSection
                        icon="🔄"
                        title="Rotation Settings"
                        badge={formData.isPartOfRotation ? 'Enabled' : 'Disabled'}
                        badgeColor={formData.isPartOfRotation ? 'green' : 'gray'}
                        isOpen={showRotation}
                        onToggle={() => setShowRotation(v => !v)}
                    >
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
                                    <Field label="Rotation Method">
                                        <Sel
                                            value={formData.rotationMethod}
                                            onChange={v => set('rotationMethod', v)}
                                            options={ROTATION_METHODS.map(m => ({ value: m.value, label: `${m.label} — ${m.description}` }))}
                                        />
                                    </Field>
                                    {formData.rotationMethod === 'weighted' && (
                                        <Field label="Rotation Weight (%)" hint="Sum of all weights in the group should equal 100">
                                            <Inp
                                                type="number" min="0" max="100" step="1"
                                                value={formData.rotationWeight}
                                                onChange={v => set('rotationWeight', parseInt(v) || 0)}
                                            />
                                        </Field>
                                    )}
                                    {formData.rotationMethod === 'targeted' && (
                                        <Field label="Targeting Rules" hint="e.g. location:IN, device:mobile, time:9-17">
                                            <textarea rows={3} style={s.textarea} placeholder="location:IN, device:mobile, time:9-17"
                                                onFocus={e => (e.target.style.borderColor = '#f97316')}
                                                onBlur={e => (e.target.style.borderColor = '#e8e8e8')} />
                                        </Field>
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
                    </ToggleSection>

                    <ToggleSection
                        icon="🎯"
                        title="Advanced Targeting"
                        isOpen={showAdvanced}
                        onToggle={() => setShowAdvanced(v => !v)}
                    >
                        <div style={s.row}>
                            <Field label="Frequency Cap (max impressions per user)" hint="Leave blank for unlimited">
                                <Inp
                                    type="number" min="0" placeholder="e.g. 5"
                                    value={formData.frequencyCap ?? ''}
                                    onChange={v => set('frequencyCap', v ? parseInt(v) : null)}
                                />
                            </Field>
                            <Field label="Cap Interval">
                                <Sel
                                    value={formData.frequencyCapInterval}
                                    onChange={v => set('frequencyCapInterval', v)}
                                    options={[
                                        { value: 'day', label: 'Per Day' },
                                        { value: 'week', label: 'Per Week' },
                                        { value: 'month', label: 'Per Month' },
                                        { value: 'total', label: 'Total Campaign' },
                                    ]}
                                />
                            </Field>
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
                            <span style={s.hint}>Select all time windows when this ad should show. Leave blank for all day.</span>
                        </div>
                    </ToggleSection>
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