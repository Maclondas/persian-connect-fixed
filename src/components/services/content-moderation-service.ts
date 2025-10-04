// AI Content Moderation Service
export interface ModerationResult {
  approved: boolean;
  score: number; // 0-1, higher means more problematic
  flaggedContent: string[];
  requiresManualReview: boolean;
  rejectionReason?: string;
}

class ContentModerationService {
  private static instance: ContentModerationService;

  // Prohibited words and patterns
  private readonly prohibitedWords = [
    // English swear words and inappropriate content
    'fuck', 'shit', 'bitch', 'damn', 'hell', 'ass', 'bastard', 'crap',
    'whore', 'slut', 'sexy', 'porn', 'nude', 'naked', 'sex', 'adult',
    'escort', 'massage', 'weapons', 'gun', 'drug', 'cocaine', 'weed',
    'marijuana', 'kill', 'murder', 'death', 'suicide', 'violence',
    'terrorism', 'bomb', 'explosive', 'hate', 'nazi', 'racist',
    
    // Persian/Farsi inappropriate words (transliterated)
    'kos', 'kir', 'kon', 'koon', 'jende', 'faheshe', 'haroomzade',
    'koskesh', 'kiram', 'goh', 'tokhmam', 'javadi', 'pedar',
    
    // General inappropriate categories
    'scam', 'fraud', 'fake', 'stolen', 'illegal', 'counterfeit',
    'pyramid', 'mlm', 'get rich quick', 'guaranteed money'
  ];

  private readonly suspiciousPatterns = [
    /\b(sex|porn|adult|escort|massage)\b/gi,
    /\b(drug|cocaine|heroin|meth|weed|marijuana)\b/gi,
    /\b(weapon|gun|rifle|pistol|bomb|explosive)\b/gi,
    /\b(kill|murder|death|suicide|violence)\b/gi,
    /\b(scam|fraud|fake|stolen|illegal|counterfeit)\b/gi,
    /\b(nazi|terrorist|hate|racist)\b/gi,
    /\$\d+.*guarantee/gi, // Money back guarantees (often scams)
    /\b(work from home|make money fast|get rich quick)\b/gi,
    /\b(call now|limited time|act fast|urgent)\b/gi, // High-pressure sales
  ];

  private readonly imageAnalysisKeywords = [
    'nude', 'naked', 'adult', 'sexy', 'inappropriate', 'weapon', 'violence'
  ];

  static getInstance(): ContentModerationService {
    if (!ContentModerationService.instance) {
      ContentModerationService.instance = new ContentModerationService();
    }
    return ContentModerationService.instance;
  }

  async moderateContent(content: {
    title: string;
    titlePersian: string;
    description: string;
    descriptionPersian: string;
    images: string[];
    category: string;
    price: number;
  }): Promise<ModerationResult> {
    const result: ModerationResult = {
      approved: false,
      score: 0,
      flaggedContent: [],
      requiresManualReview: false
    };

    // Combine all text content for analysis
    const allText = [
      content.title,
      content.titlePersian,
      content.description,
      content.descriptionPersian
    ].join(' ').toLowerCase();

    // Check for prohibited words
    const foundProhibitedWords = this.prohibitedWords.filter(word => 
      allText.includes(word.toLowerCase())
    );

    if (foundProhibitedWords.length > 0) {
      result.flaggedContent.push(`Prohibited words: ${foundProhibitedWords.join(', ')}`);
      result.score += 0.3 * foundProhibitedWords.length;
    }

    // Check suspicious patterns
    const foundPatterns: string[] = [];
    this.suspiciousPatterns.forEach((pattern, index) => {
      if (pattern.test(allText)) {
        foundPatterns.push(`Suspicious pattern ${index + 1}`);
        result.score += 0.2;
      }
    });

    if (foundPatterns.length > 0) {
      result.flaggedContent.push(...foundPatterns);
    }

    // Price analysis for potential scams
    if (content.price > 0) {
      const priceFlags = this.analyzePricing(content);
      if (priceFlags.length > 0) {
        result.flaggedContent.push(...priceFlags);
        result.score += 0.1 * priceFlags.length;
      }
    }

    // Image analysis (basic keyword-based simulation)
    const imageFlags = await this.analyzeImages(content.images);
    if (imageFlags.length > 0) {
      result.flaggedContent.push(...imageFlags);
      result.score += 0.2 * imageFlags.length;
    }

    // Category-specific checks
    const categoryFlags = this.checkCategorySpecificRules(content);
    if (categoryFlags.length > 0) {
      result.flaggedContent.push(...categoryFlags);
      result.score += 0.15 * categoryFlags.length;
    }

    // Determine final decision
    result.score = Math.min(result.score, 1); // Cap at 1.0

    if (result.score >= 0.8) {
      // High risk - reject immediately
      result.approved = false;
      result.requiresManualReview = false;
      result.rejectionReason = this.generateRejectionReason(result.flaggedContent);
    } else if (result.score >= 0.4) {
      // Medium risk - requires manual review
      result.approved = false;
      result.requiresManualReview = true;
    } else if (result.score >= 0.2) {
      // Low risk - approve but flag for monitoring
      result.approved = true;
      result.requiresManualReview = false;
    } else {
      // Clean content - approve immediately
      result.approved = true;
      result.requiresManualReview = false;
    }

    return result;
  }

  private analyzePricing(content: { price: number; category: string; title: string; description: string }): string[] {
    const flags: string[] = [];
    const text = (content.title + ' ' + content.description).toLowerCase();

    // Check for unrealistic pricing
    const categoryPriceRanges: Record<string, { min: number; max: number }> = {
      'vehicles': { min: 500, max: 200000 },
      'real-estate': { min: 50000, max: 10000000 },
      'digital-goods': { min: 10, max: 5000 },
      'fashion': { min: 5, max: 2000 },
      'pets': { min: 50, max: 5000 }
    };

    const range = categoryPriceRanges[content.category];
    if (range) {
      if (content.price < range.min || content.price > range.max) {
        flags.push(`Suspicious pricing for category: $${content.price}`);
      }
    }

    // Check for "too good to be true" indicators
    if (text.includes('urgent sale') && content.price < 100) {
      flags.push('Potential scam: urgent low-price sale');
    }

    if (text.includes('brand new') && content.category === 'vehicles' && content.price < 5000) {
      flags.push('Suspicious: brand new vehicle at very low price');
    }

    return flags;
  }

  private async analyzeImages(images: string[]): Promise<string[]> {
    // Simulate image analysis - in a real app, this would use AI vision APIs
    const flags: string[] = [];
    
    for (const imageUrl of images) {
      // Basic URL analysis for obvious inappropriate content
      const urlLower = imageUrl.toLowerCase();
      
      if (this.imageAnalysisKeywords.some(keyword => urlLower.includes(keyword))) {
        flags.push(`Potentially inappropriate image detected: ${imageUrl}`);
      }

      // Check image dimensions from URL patterns (Unsplash example)
      if (imageUrl.includes('unsplash.com')) {
        // Simulate random inappropriate content detection (5% chance)
        if (Math.random() < 0.05) {
          flags.push(`AI flagged image as potentially inappropriate: ${imageUrl}`);
        }
      }
    }

    return flags;
  }

  private checkCategorySpecificRules(content: { category: string; title: string; description: string }): string[] {
    const flags: string[] = [];
    const text = (content.title + ' ' + content.description).toLowerCase();

    switch (content.category) {
      case 'vehicles':
        if (text.includes('no papers') || text.includes('no title') || text.includes('no registration')) {
          flags.push('Vehicle: Missing legal documentation');
        }
        break;

      case 'real-estate':
        if (text.includes('cash only') && text.includes('urgent')) {
          flags.push('Real estate: Potential rental scam indicators');
        }
        break;

      case 'jobs':
        if (text.includes('no experience required') && text.includes('high pay')) {
          flags.push('Job: Potential employment scam');
        }
        if (text.includes('work from home') && text.includes('guaranteed income')) {
          flags.push('Job: Work-from-home scam indicators');
        }
        break;

      case 'services':
        if (text.includes('massage') && (text.includes('private') || text.includes('discreet'))) {
          flags.push('Services: Potentially inappropriate massage service');
        }
        break;
    }

    return flags;
  }

  private generateRejectionReason(flaggedContent: string[]): string {
    if (flaggedContent.length === 0) {
      return 'Content did not meet our community guidelines.';
    }

    const reasons = [];
    
    if (flaggedContent.some(flag => flag.includes('Prohibited words'))) {
      reasons.push('inappropriate language');
    }
    
    if (flaggedContent.some(flag => flag.includes('Suspicious pattern'))) {
      reasons.push('potentially harmful content');
    }
    
    if (flaggedContent.some(flag => flag.includes('image'))) {
      reasons.push('inappropriate images');
    }
    
    if (flaggedContent.some(flag => flag.includes('pricing'))) {
      reasons.push('suspicious pricing');
    }

    if (reasons.length === 0) {
      return 'Your ad violates our community guidelines. Please review our terms of service and try again.';
    }

    return `Your ad was rejected due to: ${reasons.join(', ')}. Please review our community guidelines and resubmit with appropriate content.`;
  }

  // Admin helper method to get detailed moderation info
  getModerationDetails(result: ModerationResult): string {
    return `
Score: ${(result.score * 100).toFixed(1)}%
Flagged Content: ${result.flaggedContent.join('; ')}
Decision: ${result.approved ? 'Approved' : 'Rejected'}
Manual Review: ${result.requiresManualReview ? 'Required' : 'Not Required'}
${result.rejectionReason ? `Reason: ${result.rejectionReason}` : ''}
    `.trim();
  }
}

export const contentModerationService = ContentModerationService.getInstance();
export default contentModerationService;