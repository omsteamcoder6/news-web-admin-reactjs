// utils/spamDetector.js
export const detectSpam = (text, author, trustLevel) => {
  const reasons = [];
  let score = 0;
  
  // Check for links
  const hasLinks = /https?:\/\/[^\s]+/g.test(text);
  if (hasLinks) {
    score += 30;
    reasons.push('Contains external links');
  }
  
  // Check for repeated characters
  if (/(.)\1{4,}/g.test(text)) {
    score += 20;
    reasons.push('Repeated characters');
  }
  
  // Check for abusive words (simplified)
  const abusiveWords = ['spam', 'troll', 'hate', 'abuse'];
  const hasAbusive = abusiveWords.some(word => text.toLowerCase().includes(word));
  if (hasAbusive) {
    score += 40;
    reasons.push('Contains suspicious words');
  }
  
  // Check for all caps
  if (text.length > 20 && text === text.toUpperCase()) {
    score += 15;
    reasons.push('Excessive capitalization');
  }
  
  // Trust level adjustment
  if (trustLevel === 'Offender') {
    score += 30;
    reasons.push('Known offender');
  } else if (trustLevel === 'New') {
    score += 15;
    reasons.push('New user');
  }
  
  return { isSpam: score >= 40, score, reasons };
};

// Rate limiting
const userCommentCounts = new Map();

export const checkRateLimit = (userId, ipAddress) => {
  const key = `${userId}-${ipAddress}`;
  const now = Date.now();
  const userData = userCommentCounts.get(key);
  
  if (!userData) {
    userCommentCounts.set(key, { count: 1, timestamp: now });
    return true;
  }
  
  // Reset if more than 1 minute has passed
  if (now - userData.timestamp > 60000) {
    userCommentCounts.set(key, { count: 1, timestamp: now });
    return true;
  }
  
  // Allow max 5 comments per minute
  if (userData.count >= 5) {
    return false;
  }
  
  userData.count++;
  return true;
};