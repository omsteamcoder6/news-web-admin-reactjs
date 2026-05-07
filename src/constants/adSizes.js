// Ad Size Specifications

export const AD_SIZES = {
  // Desktop Sizes
  desktop: {
    header: [
      { width: 728, height: 90, label: 'Leaderboard (728×90)', name: 'leaderboard' },
      { width: 970, height: 90, label: 'Large Leaderboard (970×90)', name: 'large_leaderboard' }
    ],
    homepagePremium: [
      { width: 970, height: 250, label: 'Billboard (970×250)', name: 'billboard' }
    ],
    articleMiddle: [
      { width: 300, height: 250, label: 'Medium Rectangle (300×250)', name: 'medium_rectangle' },
      { width: 336, height: 280, label: 'Large Rectangle (336×280)', name: 'large_rectangle' }
    ],
    sidebar: [
      { width: 160, height: 600, label: 'Wide Skyscraper (160×600)', name: 'wide_skyscraper' },
      { width: 300, height: 600, label: 'Half Page (300×600)', name: 'half_page' }
    ],
    footer: [
      { width: 728, height: 90, label: 'Leaderboard (728×90)', name: 'leaderboard' }
    ]
  },
  
  // Mobile Sizes
  mobile: {
    topBanner: [
      { width: 320, height: 50, label: 'Mobile Banner (320×50)', name: 'mobile_banner' },
      { width: 320, height: 100, label: 'Large Mobile Banner (320×100)', name: 'large_mobile_banner' }
    ],
    betweenNewsCards: [
      { width: 300, height: 250, label: 'Mobile Rectangle (300×250)', name: 'mobile_rectangle' }
    ],
    stickyBottom: [
      { width: 320, height: 50, label: 'Sticky Mobile Banner (320×50)', name: 'sticky_mobile_banner' }
    ]
  },
  
  // Common sizes reference
  allSizes: [
    { width: 728, height: 90, label: 'Leaderboard (728×90)', category: 'desktop', placement: 'header,footer' },
    { width: 970, height: 90, label: 'Large Leaderboard (970×90)', category: 'desktop', placement: 'header' },
    { width: 970, height: 250, label: 'Billboard (970×250)', category: 'desktop', placement: 'homepage' },
    { width: 300, height: 250, label: 'Medium Rectangle (300×250)', category: 'desktop,mobile', placement: 'article,content' },
    { width: 336, height: 280, label: 'Large Rectangle (336×280)', category: 'desktop', placement: 'article,blog' },
    { width: 160, height: 600, label: 'Wide Skyscraper (160×600)', category: 'desktop', placement: 'sidebar' },
    { width: 300, height: 600, label: 'Half Page (300×600)', category: 'desktop', placement: 'sidebar' },
    { width: 320, height: 50, label: 'Mobile Banner (320×50)', category: 'mobile', placement: 'top,bottom' },
    { width: 320, height: 100, label: 'Large Mobile Banner (320×100)', category: 'mobile', placement: 'top' },
    { width: 300, height: 250, label: 'Mobile Rectangle (300×250)', category: 'mobile', placement: 'between-cards' }
  ]
};

// Helper function to get size by placement
export const getSizeForPlacement = (placement) => {
  const sizeMap = {
    // Desktop placements
    'Header': AD_SIZES.desktop.header,
    'Homepage Premium': AD_SIZES.desktop.homepagePremium,
    'Article Middle': AD_SIZES.desktop.articleMiddle,
    'Sidebar': AD_SIZES.desktop.sidebar,
    'Footer': AD_SIZES.desktop.footer,
    // Mobile placements
    'Top Banner': AD_SIZES.mobile.topBanner,
    'Between News Cards': AD_SIZES.mobile.betweenNewsCards,
    'Sticky Bottom': AD_SIZES.mobile.stickyBottom
  };
  
  return sizeMap[placement] || [];
};

// Validation function for image dimensions
export const validateAdDimensions = (imageWidth, imageHeight, requiredWidth, requiredHeight, tolerance = 5) => {
  const widthMatch = Math.abs(imageWidth - requiredWidth) <= tolerance;
  const heightMatch = Math.abs(imageHeight - requiredHeight) <= tolerance;
  
  return {
    valid: widthMatch && heightMatch,
    message: widthMatch && heightMatch 
      ? 'Dimensions match requirement'
      : `Required: ${requiredWidth}×${requiredHeight}px. Uploaded: ${imageWidth}×${imageHeight}px`,
    required: { width: requiredWidth, height: requiredHeight },
    uploaded: { width: imageWidth, height: imageHeight }
  };
};

// Get all available placements with their sizes
export const getPlacementsWithSizes = () => {
  return {
    desktop: [
      { id: 'Header', label: 'Header Ad', sizes: AD_SIZES.desktop.header },
      { id: 'Homepage Premium', label: 'Homepage Premium Ad', sizes: AD_SIZES.desktop.homepagePremium },
      { id: 'Article Middle', label: 'Article Middle Ad', sizes: AD_SIZES.desktop.articleMiddle },
      { id: 'Sidebar', label: 'Sidebar Ad', sizes: AD_SIZES.desktop.sidebar },
      { id: 'Footer', label: 'Footer Ad', sizes: AD_SIZES.desktop.footer }
    ],
    mobile: [
      { id: 'Top Banner', label: 'Top Banner', sizes: AD_SIZES.mobile.topBanner },
      { id: 'Between News Cards', label: 'Between News Cards', sizes: AD_SIZES.mobile.betweenNewsCards },
      { id: 'Sticky Bottom', label: 'Sticky Bottom Ad', sizes: AD_SIZES.mobile.stickyBottom }
    ]
  };
};

export default AD_SIZES;