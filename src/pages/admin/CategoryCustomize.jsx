// pages/admin/CategoryCustomize.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layout/MainLayout';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import {
  Save,
  ArrowLeft,
  Eye,
  Grid,
  Columns,
  RefreshCw,
  LayoutTemplate,
  Type,
  Square,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Monitor,
  Tablet,
  Smartphone,
  Layers,
  Sliders,
  Palette,
  MousePointer,
  Tag,
  Clock,
  User,
  Hash,
  ChevronDown,
  ChevronUp,
  Copy,
  Check
} from 'lucide-react';
import categoryAPI from '../../lib/categapi';
import toast from 'react-hot-toast';

const getLayoutSettingsKey = (categoryId) => `category_layout_${categoryId}`;

const DEFAULT_SETTINGS = {
  // Structure
  orientation: 'grid',
  columns: 3,
  gapSize: 'normal',

  // Card sizing & padding
  cardSize: 'medium',
  imageAspectRatio: '16/9',
  imagePosition: 'top',         // top, left, right, background, hidden (same as showImage:false)

  // Typography
  textSize: 'base',
  fontFamily: 'system',
  titleLines: 2,
  descLines: 2,
  textAlign: 'left',

  // Card visual style
  cardStyle: 'default',
  borderRadius: 'md',
  borderWidth: '1',
  shadowLevel: 'sm',
  hoverEffect: 'lift',          // none, lift, glow, scale, border

  // Visibility toggles
  showImage: true,
  showDate: true,
  showDescription: true,
  showAuthor: false,
  showReadTime: false,
  showTags: false,
  showCategoryBadge: false,
  showDivider: false,
  showReadMoreButton: true,

  // Image effects
  imageFilter: 'none',          // none, grayscale, sepia, warm, cool
  imageOverlay: 'none',         // none, dark, accent, gradient

  // Colors
  backgroundColor: '#ffffff',
  textColor: '#0f172a',
  accentColor: '#f97316',
  cardBgColor: '#ffffff',
  borderColor: '#e2e8f0',
  tagColor: '#f1f5f9',

  // Button style
  buttonStyle: 'text',          // text, filled, outlined, pill

  // Spacing extras
  titleSpacing: 'normal',       // tight, normal, relaxed
  contentDensity: 'normal',     // compact, normal, spacious

  // Advanced
  customCSS: '',
  animateOnLoad: false,
  stickyHeader: false,

  // Per-card size overrides (px values, 0 = auto)
  cardMinHeight: 0,
  cardFixedWidth: 0,
};

const SECTION_DEFS = [
  { key: 'structure',    label: 'Structure & Layout',   icon: LayoutTemplate },
  { key: 'typography',   label: 'Typography',           icon: Type },
  { key: 'cardStyle',    label: 'Card Style & Shape',   icon: Square },
  { key: 'image',        label: 'Image Controls',       icon: Image },
  { key: 'visibility',   label: 'Visibility Toggles',   icon: Layers },
  { key: 'colors',       label: 'Color Palette',        icon: Palette },
  { key: 'interaction',  label: 'Hover & Interactions', icon: MousePointer },
  { key: 'advanced',     label: 'Advanced / Custom CSS',icon: Sliders },
];

export default function CategoryCustomize() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [selectedCard, setSelectedCard] = useState(null); // index 0–4, or null
  const [cardOverrides, setCardOverrides] = useState({}); // { 0: { cardStyle, cardSize, accentColor, ... } }
  const [openSections, setOpenSections] = useState(
    Object.fromEntries(SECTION_DEFS.map(s => [s.key, true]))
  );
  const [layoutSettings, setLayoutSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => { loadCategoryAndSettings(); }, [id]);

  const loadCategoryAndSettings = async () => {
    try {
      setLoading(true);
      let categoryData;
      try {
        categoryData = await categoryAPI.getCategoryById(id);
      } catch (err) {
        const allCategories = await categoryAPI.getCategories();
        const list = Array.isArray(allCategories)
          ? allCategories
          : allCategories.categories || allCategories.data || [];
        categoryData = list.find(cat => (cat.id || cat._id) === id);
        if (!categoryData) throw new Error('Category not found');
      }
      setCategory(categoryData);

      const savedSettings = localStorage.getItem(getLayoutSettingsKey(id));
      if (savedSettings) {
        try {
          setLayoutSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
        } catch (e) { /* ignore */ }
      }
      const savedOverrides = localStorage.getItem(getLayoutSettingsKey(id) + '_overrides');
      if (savedOverrides) {
        try { setCardOverrides(JSON.parse(savedOverrides)); } catch (e) { /* ignore */ }
      }
    } catch (error) {
      toast.error('Failed to load category settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      localStorage.setItem(getLayoutSettingsKey(id), JSON.stringify(layoutSettings));
      localStorage.setItem(getLayoutSettingsKey(id) + '_overrides', JSON.stringify(cardOverrides));
      try {
        if (categoryAPI.updateCategory) {
          await categoryAPI.updateCategory(id, { ...category, layoutSettings });
        }
      } catch (err) { /* saved locally */ }
      toast.success('Layout settings saved!');
    } catch (error) {
      toast.error('Failed to save layout settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key, value) =>
    setLayoutSettings(prev => ({ ...prev, [key]: value }));

  // Update a single per-card override property
  const updateCardOverride = (cardIndex, key, value) =>
    setCardOverrides(prev => ({
      ...prev,
      [cardIndex]: { ...(prev[cardIndex] || {}), [key]: value },
    }));

  // Reset one card's overrides back to global
  const resetCardOverrides = (cardIndex) =>
    setCardOverrides(prev => { const n = { ...prev }; delete n[cardIndex]; return n; });

  // Merge global settings + per-card overrides for rendering
  const resolvedCardSettings = (cardIndex) => ({
    ...layoutSettings,
    ...(cardOverrides[cardIndex] || {}),
  });

  const resetToDefault = () => {
    setLayoutSettings(DEFAULT_SETTINGS);
    setCardOverrides({});
    setSelectedCard(null);
  };

  const copySettingsJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(layoutSettings, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSection = (key) =>
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

  const previewWidth = {
    desktop: '100%',
    tablet: '640px',
    mobile: '375px',
  }[previewDevice];

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-600 animate-pulse">Loading customizer…</div>
        </div>
      </MainLayout>
    );
  }

  if (!category) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-red-600 font-semibold">Category not found</p>
          <Button onClick={() => navigate('/admin/categories')} variant="outline">
            Back to Categories
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/categories')}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-3xl">{category?.icon || '📁'}</span>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Layout Settings: {category?.name}
                </h1>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                Configure adaptive layouts, themes, and display logic for your frontend.
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            <Button variant="outline" onClick={copySettingsJSON} className="gap-2 text-xs">
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy JSON'}
            </Button>
            <Button variant="outline" onClick={resetToDefault} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Reset
            </Button>
            <Button
              onClick={handleSaveSettings}
              disabled={saving}
              className="bg-orange-500 hover:bg-orange-600 gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving…' : 'Save Settings'}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* ── Controls Panel ── */}
          <div className="lg:col-span-5 space-y-3">
            {SECTION_DEFS.map(({ key, label, icon: Icon }) => (
              <CollapsibleSection
                key={key}
                sectionKey={key}
                label={label}
                icon={Icon}
                open={openSections[key]}
                onToggle={toggleSection}
              >
                {key === 'structure' && (
                  <StructureSection settings={layoutSettings} update={updateSetting} />
                )}
                {key === 'typography' && (
                  <TypographySection settings={layoutSettings} update={updateSetting} />
                )}
                {key === 'cardStyle' && (
                  <CardStyleSection settings={layoutSettings} update={updateSetting} />
                )}
                {key === 'image' && (
                  <ImageSection settings={layoutSettings} update={updateSetting} />
                )}
                {key === 'visibility' && (
                  <VisibilitySection settings={layoutSettings} update={updateSetting} />
                )}
                {key === 'colors' && (
                  <ColorsSection settings={layoutSettings} update={updateSetting} />
                )}
                {key === 'interaction' && (
                  <InteractionSection settings={layoutSettings} update={updateSetting} />
                )}
                {key === 'advanced' && (
                  <AdvancedSection settings={layoutSettings} update={updateSetting} />
                )}
              </CollapsibleSection>
            ))}
          </div>

          {/* ── Live Preview ── */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 text-sm">Live Preview</h3>
              <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                {[
                  { key: 'desktop', Icon: Monitor },
                  { key: 'tablet',  Icon: Tablet },
                  { key: 'mobile',  Icon: Smartphone },
                ].map(({ key, Icon }) => (
                  <button
                    key={key}
                    onClick={() => setPreviewDevice(key)}
                    className={`p-1.5 rounded-md transition ${
                      previewDevice === key
                        ? 'bg-white shadow text-orange-500'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            {/* Per-card customization panel — shown when a card is selected */}
            {selectedCard !== null && (
              <div className="rounded-xl border-2 border-orange-300 bg-orange-50/60 p-4 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">
                      {selectedCard + 1}
                    </span>
                    <span className="text-sm font-bold text-slate-800">Card {selectedCard + 1} — Individual Overrides</span>
                    {cardOverrides[selectedCard] && Object.keys(cardOverrides[selectedCard]).length > 0 && (
                      <span className="text-xs bg-orange-200 text-orange-700 px-2 py-0.5 rounded-full font-semibold">
                        {Object.keys(cardOverrides[selectedCard]).length} override{Object.keys(cardOverrides[selectedCard]).length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {cardOverrides[selectedCard] && Object.keys(cardOverrides[selectedCard]).length > 0 && (
                      <button
                        onClick={() => resetCardOverrides(selectedCard)}
                        className="text-xs text-orange-500 hover:text-orange-700 font-semibold underline underline-offset-2"
                      >
                        Reset card
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedCard(null)}
                      className="text-slate-400 hover:text-slate-600 text-lg leading-none"
                    >✕</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Card Style */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Theme</label>
                    <select
                      value={cardOverrides[selectedCard]?.cardStyle ?? layoutSettings.cardStyle}
                      onChange={e => updateCardOverride(selectedCard, 'cardStyle', e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                    >
                      {['default','compact','elegant','modern','glass','outlined'].map(v => (
                        <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  {/* Padding */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Padding</label>
                    <select
                      value={cardOverrides[selectedCard]?.cardSize ?? layoutSettings.cardSize}
                      onChange={e => updateCardOverride(selectedCard, 'cardSize', e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                    >
                      {['small','medium','large'].map(v => (
                        <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  {/* Border Radius */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Radius</label>
                    <select
                      value={cardOverrides[selectedCard]?.borderRadius ?? layoutSettings.borderRadius}
                      onChange={e => updateCardOverride(selectedCard, 'borderRadius', e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                    >
                      {[['none','Sharp'],['sm','Subtle'],['md','Standard'],['xl','Curved'],['full','Pill']].map(([v,l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </div>
                  {/* Shadow */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Shadow</label>
                    <select
                      value={cardOverrides[selectedCard]?.shadowLevel ?? layoutSettings.shadowLevel}
                      onChange={e => updateCardOverride(selectedCard, 'shadowLevel', e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                    >
                      {[['none','None'],['xs','XS'],['sm','SM'],['md','MD'],['lg','LG'],['xl','XL']].map(([v,l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Size sliders */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Min Height — {(cardOverrides[selectedCard]?.cardMinHeight ?? layoutSettings.cardMinHeight) === 0 ? 'auto' : `${cardOverrides[selectedCard]?.cardMinHeight ?? layoutSettings.cardMinHeight}px`}
                    </label>
                    <input
                      type="range" min={0} max={500} step={10}
                      value={cardOverrides[selectedCard]?.cardMinHeight ?? layoutSettings.cardMinHeight}
                      onChange={e => updateCardOverride(selectedCard, 'cardMinHeight', Number(e.target.value))}
                      className="w-full accent-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Fixed Width — {(cardOverrides[selectedCard]?.cardFixedWidth ?? layoutSettings.cardFixedWidth) === 0 ? 'auto' : `${cardOverrides[selectedCard]?.cardFixedWidth ?? layoutSettings.cardFixedWidth}px`}
                    </label>
                    <input
                      type="range" min={0} max={500} step={10}
                      value={cardOverrides[selectedCard]?.cardFixedWidth ?? layoutSettings.cardFixedWidth}
                      onChange={e => updateCardOverride(selectedCard, 'cardFixedWidth', Number(e.target.value))}
                      className="w-full accent-orange-500"
                    />
                  </div>
                </div>

                {/* Per-card colors */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'cardBgColor', label: 'Card BG' },
                    { key: 'accentColor', label: 'Accent' },
                    { key: 'borderColor', label: 'Border' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-xs text-slate-500 mb-1">{label}</label>
                      <input
                        type="color"
                        value={cardOverrides[selectedCard]?.[key] ?? layoutSettings[key]}
                        onChange={e => updateCardOverride(selectedCard, key, e.target.value)}
                        className="w-full h-8 rounded-lg border border-slate-200 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>

                <p className="text-xs text-slate-400 italic">
                  Changes here only affect Card {selectedCard + 1}. Global settings remain unchanged for other cards.
                </p>
              </div>
            )}

            {/* Responsive preview wrapper */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 p-4 min-h-[500px] flex items-start justify-center">
              <div
                className="transition-all duration-300 w-full"
                style={{ maxWidth: previewWidth }}
              >
                <div
                  className="rounded-xl border-2 border-dashed border-slate-200 p-5 min-h-[440px] transition-all duration-300"
                  style={{ backgroundColor: layoutSettings.backgroundColor }}
                  onClick={(e) => { if (e.target === e.currentTarget) setSelectedCard(null); }}
                >
                  <div
                    className={layoutSettings.orientation === 'grid' ? 'grid' : 'flex flex-col'}
                    style={{
                      gridTemplateColumns: layoutSettings.orientation === 'grid'
                        ? `repeat(${previewDevice === 'mobile' ? 1 : previewDevice === 'tablet' ? Math.min(layoutSettings.columns, 2) : layoutSettings.columns}, minmax(0, 1fr))`
                        : undefined,
                      gap: { small: '8px', normal: '16px', large: '28px' }[layoutSettings.gapSize],
                    }}
                  >
                    {Array.from({
                      length: layoutSettings.orientation === 'grid'
                        ? (previewDevice === 'mobile' ? 1 : previewDevice === 'tablet' ? Math.min(layoutSettings.columns, 2) : Math.min(layoutSettings.columns, 5))
                        : 3
                    }, (_, i) => {
                      const overrides = cardOverrides[i] || {};
                      const hasOverride = Object.keys(overrides).length > 0;
                      return (
                        <div
                          key={i}
                          onClick={(e) => { e.stopPropagation(); setSelectedCard(i === selectedCard ? null : i); }}
                          className="cursor-pointer relative group"
                          style={{
                            outline: selectedCard === i ? '2px solid #f97316' : hasOverride ? '2px dashed #fdba74' : '2px solid transparent',
                            outlineOffset: '3px',
                            borderRadius: '10px',
                            width: (overrides.cardFixedWidth ?? layoutSettings.cardFixedWidth) > 0
                              ? `${overrides.cardFixedWidth ?? layoutSettings.cardFixedWidth}px` : undefined,
                            minHeight: (overrides.cardMinHeight ?? layoutSettings.cardMinHeight) > 0
                              ? `${overrides.cardMinHeight ?? layoutSettings.cardMinHeight}px` : undefined,
                          }}
                        >
                          {/* Card number badge */}
                          <span
                            className={`absolute -top-2 -left-2 z-20 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center transition-opacity ${
                              selectedCard === i
                                ? 'bg-orange-500 text-white opacity-100'
                                : 'bg-slate-200 text-slate-500 opacity-0 group-hover:opacity-100'
                            }`}
                          >
                            {i + 1}
                          </span>
                          {hasOverride && selectedCard !== i && (
                            <span className="absolute -top-2 -right-2 z-20 w-4 h-4 rounded-full bg-orange-400 border-2 border-white" title="Has custom overrides" />
                          )}
                          <PreviewCard
                            settings={resolvedCardSettings(i)}
                            categoryName={category?.name}
                            isSelected={selectedCard === i}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-center text-xs text-slate-300 mt-5 font-medium">
                    {selectedCard !== null
                      ? `Card ${selectedCard + 1} selected — edit overrides in the panel above`
                      : `Click any card to customise it individually · ${category?.name} · ${previewDevice}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Settings summary chips */}
            <div className="flex flex-wrap gap-1.5">
              {[
                `${layoutSettings.orientation} · ${layoutSettings.columns}col`,
                `${layoutSettings.cardStyle}`,
                `${layoutSettings.fontFamily}`,
                `hover:${layoutSettings.hoverEffect}`,
                `img:${layoutSettings.imagePosition}`,
                layoutSettings.animateOnLoad && 'animated',
              ].filter(Boolean).map(chip => (
                <span key={chip} className="px-2 py-0.5 bg-orange-50 text-orange-600 text-xs rounded-full border border-orange-100 font-medium">
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

// ── Collapsible Section Shell ──────────────────────────────────────────────
function CollapsibleSection({ sectionKey, label, icon: Icon, open, onToggle, children }) {
  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => onToggle(sectionKey)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Icon className="w-4 h-4 text-orange-500" />
          {label}
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <CardContent className="pt-0 pb-4 space-y-4">{children}</CardContent>}
    </Card>
  );
}

// ── Section: Structure ─────────────────────────────────────────────────────
function StructureSection({ settings, update }) {
  return (
    <>
      <ToggleRow label="Layout Type">
        {['grid', 'row'].map(mode => (
          <Chip key={mode} active={settings.orientation === mode} onClick={() => update('orientation', mode)}>
            {mode === 'grid' ? 'Grid' : 'List Row'}
          </Chip>
        ))}
      </ToggleRow>

      {settings.orientation === 'grid' && (
        <ToggleRow label="Columns">
          {[1, 2, 3, 4, 5].map(col => (
            <Chip key={col} active={settings.columns === col} onClick={() => update('columns', col)}>
              {col}x
            </Chip>
          ))}
        </ToggleRow>
      )}

      <ToggleRow label="Gap Size">
        {['small', 'normal', 'large'].map(g => (
          <Chip key={g} active={settings.gapSize === g} onClick={() => update('gapSize', g)}>
            {g}
          </Chip>
        ))}
      </ToggleRow>

      <ToggleRow label="Content Density">
        {['compact', 'normal', 'spacious'].map(d => (
          <Chip key={d} active={settings.contentDensity === d} onClick={() => update('contentDensity', d)}>
            {d}
          </Chip>
        ))}
      </ToggleRow>
    </>
  );
}

// ── Section: Typography ────────────────────────────────────────────────────
function TypographySection({ settings, update }) {
  return (
    <>
      <SelectRow
        label="Font Family"
        value={settings.fontFamily}
        onChange={v => update('fontFamily', v)}
        options={[
          { value: 'system',   label: 'System Default' },
          { value: 'serif',    label: 'Serif (Georgia)' },
          { value: 'mono',     label: 'Monospace' },
          { value: 'slab',     label: 'Slab Serif' },
          { value: 'display',  label: 'Display / Bold' },
        ]}
      />

      <ToggleRow label="Text Scale">
        {['small', 'base', 'large'].map(s => (
          <Chip key={s} active={settings.textSize === s} onClick={() => update('textSize', s)}>
            {s}
          </Chip>
        ))}
      </ToggleRow>

      <ToggleRow label="Text Align">
        {[
          { val: 'left',   Icon: AlignLeft },
          { val: 'center', Icon: AlignCenter },
          { val: 'right',  Icon: AlignRight },
        ].map(({ val, Icon }) => (
          <Chip key={val} active={settings.textAlign === val} onClick={() => update('textAlign', val)}>
            <Icon className="w-3.5 h-3.5" />
          </Chip>
        ))}
      </ToggleRow>

      <div className="grid grid-cols-2 gap-3">
        <NumberRow
          label="Title Lines"
          value={settings.titleLines}
          min={1} max={4}
          onChange={v => update('titleLines', v)}
        />
        <NumberRow
          label="Desc Lines"
          value={settings.descLines}
          min={1} max={6}
          onChange={v => update('descLines', v)}
        />
      </div>

      <ToggleRow label="Title Spacing">
        {['tight', 'normal', 'relaxed'].map(s => (
          <Chip key={s} active={settings.titleSpacing === s} onClick={() => update('titleSpacing', s)}>
            {s}
          </Chip>
        ))}
      </ToggleRow>
    </>
  );
}

// ── Section: Card Style ────────────────────────────────────────────────────
function CardStyleSection({ settings, update }) {
  return (
    <>
      <ToggleRow label="Theme Template" cols={2}>
        {[
          { value: 'default',   label: 'Classic Box' },
          { value: 'compact',   label: 'Flat Minimal' },
          { value: 'elegant',   label: 'Soft Gradient' },
          { value: 'modern',    label: 'High Elevation' },
          { value: 'glass',     label: 'Glassmorphism' },
          { value: 'outlined',  label: 'Outlined Only' },
        ].map(s => (
          <Chip key={s.value} active={settings.cardStyle === s.value} onClick={() => update('cardStyle', s.value)} wide>
            {s.label}
          </Chip>
        ))}
      </ToggleRow>

      <SelectRow
        label="Border Radius"
        value={settings.borderRadius}
        onChange={v => update('borderRadius', v)}
        options={[
          { value: 'none', label: 'Sharp (0px)' },
          { value: 'sm',   label: 'Subtle (4px)' },
          { value: 'md',   label: 'Standard (8px)' },
          { value: 'xl',   label: 'Curved (12px)' },
          { value: 'full', label: 'Pill (24px)' },
        ]}
      />

      <SelectRow
        label="Border Width"
        value={settings.borderWidth}
        onChange={v => update('borderWidth', v)}
        options={[
          { value: '0', label: 'None' },
          { value: '1', label: 'Thin (1px)' },
          { value: '2', label: 'Thick (2px)' },
        ]}
      />

      <SelectRow
        label="Shadow Level"
        value={settings.shadowLevel}
        onChange={v => update('shadowLevel', v)}
        options={[
          { value: 'none', label: 'None' },
          { value: 'xs',   label: 'Subtle (XS)' },
          { value: 'sm',   label: 'Light (SM)' },
          { value: 'md',   label: 'Medium (MD)' },
          { value: 'lg',   label: 'Heavy (LG)' },
          { value: 'xl',   label: 'Dramatic (XL)' },
        ]}
      />

      <ToggleRow label="Inner Padding">
        {['small', 'medium', 'large'].map(s => (
          <Chip key={s} active={settings.cardSize === s} onClick={() => update('cardSize', s)}>
            {s}
          </Chip>
        ))}
      </ToggleRow>

      <SelectRow
        label="Read More Button"
        value={settings.buttonStyle}
        onChange={v => update('buttonStyle', v)}
        options={[
          { value: 'text',     label: 'Text Link' },
          { value: 'filled',   label: 'Filled Button' },
          { value: 'outlined', label: 'Outlined Button' },
          { value: 'pill',     label: 'Pill Button' },
          { value: 'none',     label: 'Hidden' },
        ]}
      />
    </>
  );
}

// ── Section: Image ─────────────────────────────────────────────────────────
function ImageSection({ settings, update }) {
  return (
    <>
      <ToggleRow label="Image Position">
        {['top', 'left', 'right', 'background', 'hidden'].map(p => (
          <Chip key={p} active={settings.imagePosition === p} onClick={() => update('imagePosition', p)}>
            {p}
          </Chip>
        ))}
      </ToggleRow>

      <SelectRow
        label="Aspect Ratio"
        value={settings.imageAspectRatio}
        onChange={v => update('imageAspectRatio', v)}
        options={[
          { value: '1/1',   label: 'Square (1:1)' },
          { value: '4/3',   label: 'Classic (4:3)' },
          { value: '16/9',  label: 'Widescreen (16:9)' },
          { value: '3/2',   label: 'Photo (3:2)' },
          { value: '2/3',   label: 'Portrait (2:3)' },
          { value: '21/9',  label: 'Cinematic (21:9)' },
        ]}
      />

      <SelectRow
        label="Image Filter"
        value={settings.imageFilter}
        onChange={v => update('imageFilter', v)}
        options={[
          { value: 'none',      label: 'None' },
          { value: 'grayscale', label: 'Grayscale' },
          { value: 'sepia',     label: 'Sepia' },
          { value: 'warm',      label: 'Warm Tone' },
          { value: 'cool',      label: 'Cool Tone' },
          { value: 'contrast',  label: 'High Contrast' },
        ]}
      />

      <SelectRow
        label="Image Overlay"
        value={settings.imageOverlay}
        onChange={v => update('imageOverlay', v)}
        options={[
          { value: 'none',     label: 'None' },
          { value: 'dark',     label: 'Dark Dimmer' },
          { value: 'accent',   label: 'Accent Color Tint' },
          { value: 'gradient', label: 'Bottom Gradient Fade' },
        ]}
      />
    </>
  );
}

// ── Section: Visibility ────────────────────────────────────────────────────
function VisibilitySection({ settings, update }) {
  const flags = [
    { key: 'showDate',           label: 'Publication Date',   Icon: Clock },
    { key: 'showAuthor',         label: 'Author Name',        Icon: User },
    { key: 'showDescription',    label: 'Description Text',   Icon: AlignLeft },
    { key: 'showReadTime',       label: 'Read Time Estimate', Icon: Clock },
    { key: 'showTags',           label: 'Tags / Labels',      Icon: Tag },
    { key: 'showCategoryBadge',  label: 'Category Badge',     Icon: Hash },
    { key: 'showDivider',        label: 'Content Divider',    Icon: Layers },
    { key: 'showReadMoreButton', label: 'Read More Button',   Icon: MousePointer },
  ];
  return (
    <div className="space-y-1">
      {flags.map(({ key, label, Icon }) => (
        <label key={key} className="flex items-center justify-between cursor-pointer px-2 py-2 hover:bg-slate-50 rounded-lg group">
          <span className="flex items-center gap-2 text-sm text-slate-700">
            <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-400 transition" />
            {label}
          </span>
          <Toggle checked={settings[key]} onChange={v => update(key, v)} />
        </label>
      ))}
    </div>
  );
}

// ── Section: Colors ────────────────────────────────────────────────────────
function ColorsSection({ settings, update }) {
  const swatches = [
    { key: 'backgroundColor', label: 'Page Canvas BG' },
    { key: 'cardBgColor',     label: 'Card Background' },
    { key: 'textColor',       label: 'Body Text' },
    { key: 'accentColor',     label: 'Accent / CTA' },
    { key: 'borderColor',     label: 'Border / Divider' },
    { key: 'tagColor',        label: 'Tag Background' },
  ];

  // Quick-pick accent presets
  const accentPresets = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b', '#06b6d4', '#ec4899'];

  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        {swatches.map(({ key, label }) => (
          <div key={key}>
            <label className="block text-xs text-slate-500 mb-1 truncate">{label}</label>
            <input
              type="color"
              value={settings[key]}
              onChange={e => update(key, e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-200 cursor-pointer"
            />
          </div>
        ))}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Accent Quick-Pick
        </label>
        <div className="flex gap-2 flex-wrap">
          {accentPresets.map(color => (
            <button
              key={color}
              onClick={() => update('accentColor', color)}
              className={`w-7 h-7 rounded-full border-2 transition ${
                settings.accentColor === color ? 'border-slate-700 scale-110' : 'border-transparent hover:scale-105'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>
    </>
  );
}

// ── Section: Interactions ──────────────────────────────────────────────────
function InteractionSection({ settings, update }) {
  return (
    <>
      <ToggleRow label="Card Hover Effect">
        {['none', 'lift', 'glow', 'scale', 'border'].map(e => (
          <Chip key={e} active={settings.hoverEffect === e} onClick={() => update('hoverEffect', e)}>
            {e}
          </Chip>
        ))}
      </ToggleRow>

      <label className="flex items-center justify-between cursor-pointer px-2 py-2 hover:bg-slate-50 rounded-lg">
        <span className="text-sm text-slate-700">Animate on load (stagger)</span>
        <Toggle checked={settings.animateOnLoad} onChange={v => update('animateOnLoad', v)} />
      </label>

      <label className="flex items-center justify-between cursor-pointer px-2 py-2 hover:bg-slate-50 rounded-lg">
        <span className="text-sm text-slate-700">Sticky category header</span>
        <Toggle checked={settings.stickyHeader} onChange={v => update('stickyHeader', v)} />
      </label>
    </>
  );
}

// ── Section: Advanced ──────────────────────────────────────────────────────
function AdvancedSection({ settings, update }) {
  return (
    <>
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          Custom CSS Override
        </label>
        <textarea
          value={settings.customCSS}
          onChange={e => update('customCSS', e.target.value)}
          rows={5}
          placeholder=".category-card { /* your overrides */ }"
          className="w-full text-xs p-3 rounded-lg border border-slate-200 bg-slate-50 font-mono resize-y focus:ring-2 focus:ring-orange-300 focus:outline-none"
        />
        <p className="text-xs text-slate-400 mt-1">Applied inside the frontend renderer scope.</p>
      </div>

      <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Current Config JSON</p>
        <pre className="text-xs text-slate-600 overflow-auto max-h-40 leading-relaxed">
          {JSON.stringify(settings, null, 2)}
        </pre>
      </div>
    </>
  );
}

// ── Preview Card ───────────────────────────────────────────────────────────
function PreviewCard({ settings, categoryName, isSelected }) {
  const paddingMap    = { small: 'p-3', medium: 'p-5', large: 'p-8' };
  const textScaleMap  = { small: 'text-xs', base: 'text-sm', large: 'text-base' };
  const titleScaleMap = { small: 'text-sm', base: 'text-base', large: 'text-xl' };
  const radiusMap     = { none: 'rounded-none', sm: 'rounded-sm', md: 'rounded-md', xl: 'rounded-xl', full: 'rounded-2xl' };
  const borderMap     = { 0: 'border-0', 1: 'border', 2: 'border-2' };
  const shadowMap     = { none: '', xs: 'shadow-xs', sm: 'shadow-sm', md: 'shadow-md', lg: 'shadow-lg', xl: 'shadow-xl' };
  const hoverMap      = {
    none:   '',
    lift:   'hover:-translate-y-1 hover:shadow-lg',
    glow:   'hover:ring-2 hover:ring-orange-400/60',
    scale:  'hover:scale-[1.02]',
    border: 'hover:border-orange-400',
  };
  const alignMap      = { left: 'text-left', center: 'text-center', right: 'text-right' };
  const spacingMap    = { tight: 'leading-tight', normal: 'leading-snug', relaxed: 'leading-relaxed' };
  const fontMap       = {
    system:  'font-sans',
    serif:   'font-serif',
    mono:    'font-mono',
    slab:    'font-serif',
    display: 'font-black',
  };
  const filterMap     = {
    none:      '',
    grayscale: 'grayscale',
    sepia:     'sepia',
    warm:      'brightness-105 saturate-150',
    cool:      'brightness-95 hue-rotate-15',
    contrast:  'contrast-125',
  };

  const cardStyleMap = {
    default:  'bg-white shadow-sm',
    compact:  'bg-slate-50',
    elegant:  'bg-gradient-to-br from-white to-slate-50 shadow-md',
    modern:   'bg-white shadow-xl',
    glass:    'bg-white/60 backdrop-blur-md shadow-md',
    outlined: 'bg-transparent',
  };

  const isRow        = settings.orientation === 'row';
  const showImg      = settings.imagePosition !== 'hidden' && settings.showImage !== false;
  const isBgImg      = settings.imagePosition === 'background';
  const isLeftRight  = ['left', 'right'].includes(settings.imagePosition);

  const contentDensityGap = {
    compact:  'space-y-0.5',
    normal:   'space-y-1.5',
    spacious: 'space-y-3',
  }[settings.contentDensity] || 'space-y-1.5';

  const aspectPadding = {
    '1/1':  'pb-[100%]',
    '4/3':  'pb-[75%]',
    '16/9': 'pb-[56.25%]',
    '3/2':  'pb-[66.66%]',
    '2/3':  'pb-[150%]',
    '21/9': 'pb-[42.85%]',
  }[settings.imageAspectRatio] || 'pb-[56.25%]';

  const imgBlock = showImg && !isBgImg && (
    <div
      className={`relative shrink-0 overflow-hidden ${
        isLeftRight ? 'w-28 h-28 rounded-lg' : `w-full ${radiusMap[settings.borderRadius]} rounded-b-none`
      }`}
    >
      <div className={`relative w-full ${!isLeftRight ? aspectPadding : 'h-full'}`}>
        <div
          className={`absolute inset-0 flex items-center justify-center ${filterMap[settings.imageFilter]}`}
          style={{ backgroundImage: `linear-gradient(135deg, ${settings.accentColor}30, ${settings.accentColor}60)` }}
        >
          <span className="text-3xl opacity-70">📰</span>
        </div>
        {settings.imageOverlay !== 'none' && (
          <div
            className="absolute inset-0"
            style={{
              background: settings.imageOverlay === 'dark'
                ? 'rgba(0,0,0,0.3)'
                : settings.imageOverlay === 'accent'
                ? `${settings.accentColor}55`
                : 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)',
            }}
          />
        )}
      </div>
    </div>
  );

  return (
    <div
      className={`
        relative overflow-hidden transition-all duration-200
        ${cardStyleMap[settings.cardStyle]}
        ${paddingMap[settings.cardSize]}
        ${radiusMap[settings.borderRadius]}
        ${borderMap[settings.borderWidth]}
        ${shadowMap[settings.shadowLevel]}
        ${hoverMap[settings.hoverEffect]}
        ${isBgImg ? 'relative' : ''}
        ${isRow || isLeftRight ? 'flex gap-3' : 'flex flex-col'}
        ${isSelected ? 'ring-2 ring-orange-400 ring-offset-1' : ''}
      `}
      style={{
        borderColor: settings.borderWidth !== '0' ? settings.borderColor : undefined,
        backgroundColor: settings.cardBgColor,
        animation: settings.animateOnLoad ? 'fadeInUp 0.4s ease forwards' : undefined,
        minHeight: settings.cardMinHeight > 0 ? `${settings.cardMinHeight}px` : undefined,
        width: settings.cardFixedWidth > 0 ? `${settings.cardFixedWidth}px` : undefined,
      }}
    >
      {/* Background image mode */}
      {isBgImg && showImg && (
        <div
          className="absolute inset-0 flex items-center justify-center -z-0"
          style={{ backgroundImage: `linear-gradient(135deg, ${settings.accentColor}20, ${settings.accentColor}50)` }}
        >
          <span className="text-5xl opacity-20">📰</span>
          <div
            className="absolute inset-0"
            style={{ background: settings.imageOverlay === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.15)' }}
          />
        </div>
      )}

      {/* Left image */}
      {settings.imagePosition === 'left' && imgBlock}

      {/* Top image */}
      {settings.imagePosition === 'top' && !isLeftRight && imgBlock}

      {/* Content */}
      <div className={`flex-1 min-w-0 relative z-10 ${isBgImg ? paddingMap[settings.cardSize] : ''} ${contentDensityGap}`}>
        {settings.showCategoryBadge && (
          <span
            className="inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-1"
            style={{ backgroundColor: `${settings.accentColor}20`, color: settings.accentColor }}
          >
            {categoryName || 'Category'}
          </span>
        )}

        {settings.showDivider && <hr className="border-t mb-1" style={{ borderColor: settings.borderColor }} />}

        <h3
          className={`font-bold ${titleScaleMap[settings.textSize]} ${fontMap[settings.fontFamily]} ${spacingMap[settings.titleSpacing]} ${alignMap[settings.textAlign]}`}
          style={{
            color: isBgImg ? '#fff' : settings.textColor,
            WebkitLineClamp: settings.titleLines,
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          Dynamic Layout Node Element
        </h3>

        <div className={`flex items-center gap-3 flex-wrap ${alignMap[settings.textAlign]}`}>
          {settings.showDate && (
            <p className="text-xs text-slate-400 font-medium">May 25, 2026</p>
          )}
          {settings.showReadTime && (
            <p className="text-xs text-slate-400">4 min read</p>
          )}
          {settings.showAuthor && (
            <p className="text-xs text-slate-400">By Editor</p>
          )}
        </div>

        {settings.showDescription && (
          <p
            className={`text-slate-500 leading-relaxed ${textScaleMap[settings.textSize]} ${alignMap[settings.textAlign]}`}
            style={{
              WebkitLineClamp: settings.descLines,
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              color: isBgImg ? 'rgba(255,255,255,0.8)' : undefined,
            }}
          >
            This sandbox card maps structural config parameters inside the{' '}
            <strong>{categoryName || 'Active'}</strong> layout viewport.
          </p>
        )}

        {settings.showTags && (
          <div className={`flex gap-1 flex-wrap ${alignMap[settings.textAlign] === 'text-center' ? 'justify-center' : ''}`}>
            {['Design', 'Layout', 'UI'].map(tag => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: settings.tagColor, color: settings.textColor }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {settings.showReadMoreButton && settings.buttonStyle !== 'none' && (
          <div className={alignMap[settings.textAlign]}>
            <ReadMoreButton style={settings.buttonStyle} color={settings.accentColor} />
          </div>
        )}
      </div>

      {/* Right image */}
      {settings.imagePosition === 'right' && imgBlock}
    </div>
  );
}

function ReadMoreButton({ style, color }) {
  if (style === 'text') {
    return (
      <span className="text-xs font-bold hover:opacity-70 transition" style={{ color }}>
        Read more →
      </span>
    );
  }
  if (style === 'filled') {
    return (
      <button
        className="mt-1 text-xs font-bold px-3 py-1.5 rounded-lg text-white transition hover:opacity-90"
        style={{ backgroundColor: color }}
      >
        Read More
      </button>
    );
  }
  if (style === 'outlined') {
    return (
      <button
        className="mt-1 text-xs font-bold px-3 py-1.5 rounded-lg border-2 transition hover:bg-orange-50"
        style={{ borderColor: color, color }}
      >
        Read More
      </button>
    );
  }
  if (style === 'pill') {
    return (
      <button
        className="mt-1 text-xs font-bold px-4 py-1.5 rounded-full text-white transition hover:opacity-90"
        style={{ backgroundColor: color }}
      >
        Read More
      </button>
    );
  }
  return null;
}

// ── Small Primitives ───────────────────────────────────────────────────────
function ToggleRow({ label, children, cols }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
        {label}
      </label>
      <div className={`flex gap-1.5 flex-wrap ${cols === 2 ? 'grid grid-cols-2' : ''}`}>
        {children}
      </div>
    </div>
  );
}

function Chip({ active, onClick, children, wide }) {
  return (
    <button
      onClick={onClick}
      className={`${wide ? 'w-full' : ''} py-1.5 px-3 text-xs capitalize font-medium rounded-lg border-2 transition whitespace-nowrap ${
        active
          ? 'border-orange-500 bg-orange-50 text-orange-700'
          : 'border-slate-200 hover:border-slate-300 text-slate-600'
      }`}
    >
      {children}
    </button>
  );
}

function SelectRow({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-orange-300 focus:outline-none"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function NumberRow({ label, value, min, max, onChange }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="px-2 py-1.5 text-slate-500 hover:bg-slate-100 transition text-sm font-bold"
        >−</button>
        <span className="flex-1 text-center text-xs font-semibold">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="px-2 py-1.5 text-slate-500 hover:bg-slate-100 transition text-sm font-bold"
        >+</button>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        checked ? 'bg-orange-500' : 'bg-slate-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-4' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}