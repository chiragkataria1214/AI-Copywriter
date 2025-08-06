import { TrainingConfig } from '@shared/training-config';

// Helper function to build target persona section
export function buildTargetPersonaSection(concept: string, trainingConfig: TrainingConfig): string {
  if (!concept || concept === 'none' || !trainingConfig.personaPillars?.[concept]) {
    return '';
  }

  const persona = trainingConfig.personaPillars[concept];
  let section = `

TARGET PERSONA - ${concept.toUpperCase()}:
${persona.description ? `Description: ${persona.description}` : ''}`;

  if (persona.pillars && persona.pillars.length > 0) {
    const enabledPillars = persona.pillars.filter((_, index) => 
      persona.enabledPillars?.[index] !== false
    );
    
    if (enabledPillars.length > 0) {
      section += `
Key Targeting Pillars:
${enabledPillars.map(pillar => `- ${pillar}`).join('\n')}`;
    }
  }

  section += `

PERSONA-SPECIFIC TARGETING REQUIREMENTS:
- Tailor ALL headlines and primary text to speak directly to this persona
- Use language patterns and scenarios this audience relates to
- Address their specific pain points and motivations
- Reference their lifestyle and daily challenges`;

  return section;
}

// Helper function to build selected products section
export function buildSelectedProductsSection(selectedProduct: string | undefined, selectedProducts: string[] | undefined, trainingConfig: TrainingConfig): string {
  if (!selectedProduct && (!selectedProducts || selectedProducts.length === 0)) {
    return '';
  }

  let section = `

PRODUCT FOCUS:`;

  // Handle single selected product
  if (selectedProduct) {
    const productConfig = trainingConfig.productClaims?.[selectedProduct];
    const displayName = productConfig?.displayName || selectedProduct;
    section += `
Primary Product: ${displayName}`;
  }

  // Handle multiple selected products
  if (selectedProducts && selectedProducts.length > 0) {
    const productDisplayNames = selectedProducts.map(product => {
      const productConfig = trainingConfig.productClaims?.[product];
      return productConfig?.displayName || product;
    });
    section += `
Selected Products: ${productDisplayNames.join(', ')}`;
  }

  section += `

PRODUCT-SPECIFIC CLAIMS:`;

  // Add claims for single product
  if (selectedProduct && trainingConfig.productClaims?.[selectedProduct]) {
    const productConfig = trainingConfig.productClaims[selectedProduct];
    const displayName = productConfig.displayName || selectedProduct;
    section += `
${displayName.toUpperCase()}:`;
    
    if (productConfig.approvedClaims && productConfig.approvedClaims.length > 0) {
      section += `
Approved Claims (USE THESE):`;
      productConfig.approvedClaims.forEach((claim, index) => {
        if (productConfig.enabledApproved?.[index] !== false) {
          section += `
- ${claim}`;
        }
      });
    }
    
    if (productConfig.prohibitedClaims && productConfig.prohibitedClaims.length > 0) {
      section += `
Prohibited Claims (NEVER USE):`;
      productConfig.prohibitedClaims.forEach((claim, index) => {
        if (productConfig.enabledProhibited?.[index] !== false) {
          section += `
- ${claim}`;
        }
      });
    }
  }

  // Add claims for multiple products
  if (selectedProducts && selectedProducts.length > 0 && trainingConfig.productClaims) {
    selectedProducts.forEach(product => {
      const productConfig = trainingConfig.productClaims[product];
      if (productConfig) {
        const displayName = productConfig.displayName || product;
        section += `
${displayName.toUpperCase()}:`;
        
        if (productConfig.approvedClaims && productConfig.approvedClaims.length > 0) {
          section += `
Approved Claims (USE THESE):`;
          productConfig.approvedClaims.forEach((claim, index) => {
            if (productConfig.enabledApproved?.[index] !== false) {
              section += `
- ${claim}`;
            }
          });
        }
        
        if (productConfig.prohibitedClaims && productConfig.prohibitedClaims.length > 0) {
          section += `
Prohibited Claims (NEVER USE):`;
          productConfig.prohibitedClaims.forEach((claim, index) => {
            if (productConfig.enabledProhibited?.[index] !== false) {
              section += `
- ${claim}`;
            }
          });
        }
      }
    });
  }

  section += `

PRODUCT-SPECIFIC REQUIREMENTS:
- Feature the selected product(s) prominently in headlines and copy
- Use ONLY the approved claims listed above for each product
- NEVER use any of the prohibited claims listed above
- Highlight unique benefits and selling points of these specific products
- Create compelling product-focused calls-to-action
- Ensure copy drives interest in these specific products`;

  return section;
}

// Helper function to build comprehensive AI Settings context
export function buildAISettingsContext(trainingConfig: TrainingConfig, request: {
  concept?: string;
  selectedProduct?: string;
  selectedProducts?: string[];
  brandDrBalance?: number;
  useJonesBrandGuide?: boolean;
}) {
  const { concept = '', selectedProduct = '', selectedProducts = [], brandDrBalance = 50, useJonesBrandGuide = true } = request;
  
  // Handle optional personas - if concept is 'none' or empty, skip persona targeting
  
  let context = '';
  
  if (useJonesBrandGuide && trainingConfig) {
    // Brand Guidelines
    if (trainingConfig.brandGuidelines) {
      context += '\nJONES ROAD BEAUTY BRAND GUIDELINES:\n';
      context += `Core Positioning: ${trainingConfig.brandGuidelines.corePositioning}\n\n`;
      
      // Brand Voice (only enabled ones)
      if (trainingConfig.brandGuidelines.brandVoice) {
        context += 'Brand Voice Rules:\n';
        trainingConfig.brandGuidelines.brandVoice.forEach((rule, index) => {
          if (trainingConfig.brandGuidelines.enabledBrandVoice?.[index] !== false) {
            context += `- ${rule}\n`;
          }
        });
        context += '\n';
      }
      
      // Key Terminology (only enabled ones)
      if (trainingConfig.brandGuidelines.keyTerminology) {
        context += 'Key Terms & Phrases:\n';
        trainingConfig.brandGuidelines.keyTerminology.forEach((term, index) => {
          if (trainingConfig.brandGuidelines.enabledKeyTerminology?.[index] !== false) {
            context += `- ${term}\n`;
          }
        });
        context += '\n';
      }
      
      // Approved Language (only enabled ones)
      if (trainingConfig.brandGuidelines.approvedLanguage) {
        context += 'Approved Language:\n';
        trainingConfig.brandGuidelines.approvedLanguage.forEach((phrase, index) => {
          if (trainingConfig.brandGuidelines.enabledApprovedLanguage?.[index] !== false) {
            context += `- ${phrase}\n`;
          }
        });
        context += '\n';
      }
      
      // Avoided Language (only enabled ones)
      if (trainingConfig.brandGuidelines.avoidedLanguage) {
        context += 'Avoid These Phrases:\n';
        trainingConfig.brandGuidelines.avoidedLanguage.forEach((phrase, index) => {
          if (trainingConfig.brandGuidelines.enabledAvoidedLanguage?.[index] !== false) {
            context += `- ${phrase}\n`;
          }
        });
        context += '\n';
      }
    }
    
    // Product Claims
    if (selectedProduct && trainingConfig.productClaims && trainingConfig.productClaims[selectedProduct]) {
      const productClaims = trainingConfig.productClaims[selectedProduct];
      context += `PRODUCT-SPECIFIC CLAIMS FOR ${selectedProduct.toUpperCase()}:\n`;
      
      if (productClaims.approvedClaims && productClaims.approvedClaims.filter((_, index) => productClaims.enabledApproved?.[index] !== false).length > 0) {
        context += 'Approved Claims:\n';
        productClaims.approvedClaims.forEach((claim, index) => {
          if (productClaims.enabledApproved?.[index] !== false) {
            context += `- ${claim}\n`;
          }
        });
      }
      
      if (productClaims.prohibitedClaims && productClaims.prohibitedClaims.filter((_, index) => productClaims.enabledProhibited?.[index] !== false).length > 0) {
        context += 'Prohibited Claims (Never Use):\n';
        productClaims.prohibitedClaims.forEach((claim, index) => {
          if (productClaims.enabledProhibited?.[index] !== false) {
            context += `- ${claim}\n`;
          }
        });
      }
      context += '\n';
    }
    
    // Multi-Product Claims for retention
    if (selectedProducts && selectedProducts.length > 0 && trainingConfig.productClaims) {
      context += 'MULTI-PRODUCT CLAIMS:\n';
      selectedProducts.forEach(product => {
        if (trainingConfig.productClaims[product]) {
          context += `${product.toUpperCase()}:\n`;
          const productClaims = trainingConfig.productClaims[product];
          if (productClaims.approvedClaims) {
            productClaims.approvedClaims.forEach((claim, index) => {
              if (productClaims.enabledApproved?.[index] !== false) {
                context += `  - ${claim}\n`;
              }
            });
          }
        }
      });
      context += '\n';
    }
    
    // Persona Pillars - skip if concept is 'none' or empty
    if (concept && concept !== 'none' && trainingConfig.personaPillars && trainingConfig.personaPillars[concept]) {
      const persona = trainingConfig.personaPillars[concept];
      context += `TARGET PERSONA - ${concept.toUpperCase()}:\n`;
      if (persona.description) {
        context += `Description: ${persona.description}\n`;
      }
      if (persona.pillars && persona.pillars.length > 0) {
        context += 'Key Pillars:\n';
        persona.pillars.forEach((pillar, index) => {
          if (persona.enabledPillars?.[index] !== false) {
            context += `- ${pillar}\n`;
          }
        });
      }
      context += '\n';
    }
  }
  
  // Brand/DR Balance
  const brandPercent = brandDrBalance;
  const drPercent = 100 - brandPercent;
  context += `BRAND/DR BALANCE: ${brandPercent}% Brand Voice, ${drPercent}% Direct Response\n`;
  
  // Brand-First Guidelines
  if (trainingConfig.copyFrameworks?.brandDrBalance?.brandFirst && trainingConfig.copyFrameworks.brandDrBalance.brandFirst.length > 0) {
    const brandGuidelines = trainingConfig.copyFrameworks.brandDrBalance.brandFirst.filter(g => g && g.trim() !== '');
    if (brandGuidelines.length > 0) {
      context += `\nBRAND-FIRST GUIDELINES:\n`;
      brandGuidelines.forEach(guideline => {
        context += `- ${guideline}\n`;
      });
    }
  }
  
  // Direct Response Guidelines
  if (trainingConfig.copyFrameworks?.brandDrBalance?.directResponse && trainingConfig.copyFrameworks.brandDrBalance.directResponse.length > 0) {
    const drGuidelines = trainingConfig.copyFrameworks.brandDrBalance.directResponse.filter(g => g && g.trim() !== '');
    if (drGuidelines.length > 0) {
      context += `\nDIRECT RESPONSE GUIDELINES:\n`;
      drGuidelines.forEach(guideline => {
        context += `- ${guideline}\n`;
      });
    }
  }
  
  context += '\n';
  
  return context;
}

// Helper function for Ad Copy Generation -- to build landing page context section
export async function buildLandingPageContext(landingPageUrl?: string): Promise<string> {
  if (!landingPageUrl || !landingPageUrl.trim()) {
    return '';
  }

  let landingPageContent = '';
  try {
    const response = await fetch(landingPageUrl);
    if (response.ok) {
      const html = await response.text();
      // Extract basic text content (simplified approach)
      landingPageContent = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 2000); // Limit to first 2000 characters
    }
  } catch (error) {
    console.error('Failed to fetch landing page:', error);
  }

  return landingPageContent ? `
LANDING PAGE CONTEXT:
${landingPageContent}

FUNNEL ALIGNMENT REQUIREMENT:
Ensure the ad copy creates a seamless transition from ad to landing page. The messaging should be congruent - if the landing page emphasizes certain benefits or uses specific language, mirror that in the ad copy to create expectation alignment and reduce bounce rate.
` : '';
}

// Helper function to build copy frameworks section
export function buildCopyFrameworksSection(trainingConfig: TrainingConfig): string {
  if (!trainingConfig.copyFrameworks?.headlineFrameworks) {
    return '';
  }

  return `

HEADLINE FRAMEWORK GUIDANCE:
Use these proven frameworks to create diverse headline variations:
${trainingConfig.copyFrameworks.headlineFrameworks.map(framework => `
• ${framework.name}: ${framework.description}
  Template: ${framework.template}
  ${framework.examples && framework.examples.length > 0 ? `Examples: ${framework.examples.slice(0, 2).join(', ')}` : ''}`).join('')}

FRAMEWORK APPLICATION:
- Create headlines using different frameworks for testing variety
- Match framework choice to the specific customer motivation being targeted
- Ensure each headline serves a distinct strategic purpose`;
}

// Helper function to build custom brief section
export function buildCustomBriefSection(customBrief?: string): string {
  if (!customBrief || !customBrief.trim()) {
    return '';
  }

  return `

CUSTOM BRIEF FOR THIS GENERATION:
${customBrief.trim()}

PRIORITY INSTRUCTION: Incorporate the specific instructions above into the ad copy while maintaining brand voice and framework structure.`;
} 