import { TrainingConfig } from "@shared/training-config";
import { DEFAULT_BRAND_DR_BALANCE, DEFAULT_USE_JONES_BRAND_GUIDE } from "@shared/constants";

export function buildTargetPersonaSection(trainingConfig: TrainingConfig): string {
  const personas = trainingConfig.personaPillars;
  if (!personas || Object.keys(personas).length === 0) {
    return '';
  }

  const blocks: string[] = [];

  for (const personaKey of Object.keys(personas)) {
    const persona = personas[personaKey];
    let block = `
  TARGET PERSONA - ${personaKey.toUpperCase()}:
  ${persona.description ? `Description: ${persona.description}` : ''}`;

    if (persona.pillars && persona.pillars.length > 0) {
      const enabledPillars = persona.pillars.filter((_, index) => persona.enabledPillars?.[index] !== false);
      if (enabledPillars.length > 0) {
        block += `
  Key Targeting Pillars:
  ${enabledPillars.map(pillar => `- ${pillar}`).join('\n')}`;
      }
    }

    if (persona.subpersonas) {
      for (const subpersonaName of Object.keys(persona.subpersonas)) {
        const subpersona = persona.subpersonas[subpersonaName];
        block += `
  
  SUBPERSONA - ${subpersonaName.toUpperCase()}:
  ${subpersona.description ? `Description: ${subpersona.description}` : ''}`;

        const pillarsToUse = subpersona.pillars || persona.pillars || [];
        const enabledPillarsToUse = subpersona.enabledPillars || persona.enabledPillars || [];

        if (pillarsToUse && pillarsToUse.length > 0) {
          const enabledPillars = pillarsToUse.filter((_, index) => enabledPillarsToUse?.[index] !== false);
          if (enabledPillars.length > 0) {
            block += `
  Key Targeting Pillars:
  ${enabledPillars.map(pillar => `- ${pillar}`).join('\n')}`;
          }
        }
      }
    }

    blocks.push(block);
  }

  return `
  TARGET PERSONAS OVERVIEW:
  ${blocks.join('\n\n')}`;
}

export function buildSelectedTargetPersonaSection(personaInput: string, trainingConfig: TrainingConfig): string {
  if (!personaInput || personaInput === 'none') {
    return '';
  }

  // Parse persona to handle subpersona format: "persona:subpersonaId"
  const parts = personaInput.split(':');
  const personaKey = parts[0];
  const subpersonaId = parts[1];

  const persona = trainingConfig.personaPillars?.[personaKey];
  if (!persona) {
    return '';
  }

  let section = `
  
  TARGET PERSONA - ${personaKey.toUpperCase()}:
  ${persona.description ? `Description: ${persona.description}` : ''}`;

  // Handle subpersona if specified
  if (subpersonaId && persona.subpersonas) {
    // Find subpersona by ID
    const subpersonaName = Object.keys(persona.subpersonas).find(name =>
      persona.subpersonas![name].id === subpersonaId
    );

    if (subpersonaName && persona.subpersonas[subpersonaName]) {
      const subpersona = persona.subpersonas[subpersonaName];
      section += `
  
  SUBPERSONA - ${subpersonaName.toUpperCase()}:
  ${subpersona.description ? `Description: ${subpersona.description}` : ''}`;

      // Use subpersona pillars if available, otherwise fall back to main persona pillars
      const pillarsToUse = subpersona.pillars || persona.pillars;
      const enabledPillarsToUse = subpersona.enabledPillars || persona.enabledPillars;

      if (pillarsToUse && pillarsToUse.length > 0) {
        const enabledPillars = pillarsToUse.filter((_, index) =>
          enabledPillarsToUse?.[index] !== false
        );

        if (enabledPillars.length > 0) {
          section += `
  Key Targeting Pillars:
  ${enabledPillars.map(pillar => `- ${pillar}`).join('\n')}`;
        }
      }
    }
  } else {
    // Standard persona without subpersona
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
  }

  return section;
}
export function buildSelectedProductsSection(selectedProduct: string | undefined, selectedProducts: string[] | undefined, trainingConfig: TrainingConfig): string {
  if (!selectedProduct && (!selectedProducts || selectedProducts.length === 0)) {
    return '';
  }

  let section = ``;

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
  
`;

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

  return section;
}

/**
 * Build a section that lists claims for all products defined in trainingConfig
 */
export function buildAllProductsSection(trainingConfig: TrainingConfig): string {
  const allClaims = trainingConfig.productClaims;
  if (!allClaims || Object.keys(allClaims).length === 0) {
    return '';
  }

  let section = `
  PRODUCT CATALOG OVERVIEW:`;

  for (const productKey of Object.keys(allClaims)) {
    const productConfig = allClaims[productKey];
    const displayName = productConfig.displayName || productKey;
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

  section += `

  PRODUCT CATALOG REQUIREMENTS:
  - Use ONLY approved claims for each product
  - NEVER use prohibited claims
  - Ensure product-specific benefits are clear`;

  return section;
}

export function buildMetaAdCopyFrameworksSection(trainingConfig: TrainingConfig): string {
  if (!trainingConfig.copyFrameworks?.headlineFrameworks) {
    return '';
  }

  return `
  ${trainingConfig.copyFrameworks.headlineFrameworks.map(framework => `
  • ${framework.name}: ${framework.description}
    Template: ${framework.template}
    ${framework.examples && framework.examples.length > 0 ? `Examples: ${framework.examples.slice(0, 2).join(', ')}` : ''}`).join('')}`;
}

export function buildLandingPageFrameworksSection(trainingConfig: TrainingConfig, landingPageType?: string): string {
  if (!trainingConfig.copyFrameworks?.landingPageFrameworks) {
    return '';
  }

  const frameworks = trainingConfig.copyFrameworks.landingPageFrameworks;

  return `
  
  LANDING PAGE FRAMEWORK GUIDANCE:
  Use these proven frameworks to structure compelling landing page copy:
  ${frameworks.map(framework => `
  • ${framework.name}: ${framework.description}
    Content Sequence: ${framework.contentSequence.join(' → ')}
    Reason Structure: ${framework.reasonStructure.join(', ')}
    Optimization Rules: ${framework.optimizationRules.join('; ')}
    ${framework.realExamples && framework.realExamples.length > 0 ? `Examples: ${framework.realExamples.slice(0, 2).join(', ')}` : ''}
    ${framework.outputRequirements ? `Output Requirements: ${framework.outputRequirements}` : ''}
    ${framework.systemPrompt ? `System Prompt: ${framework.systemPrompt}` : ''}`).join('')}
  `;
}

export function buildEmailFrameworksSection(trainingConfig: TrainingConfig): string {
  if (!trainingConfig.copyFrameworks?.emailFrameworks) {
    return '';
  }

  return `
  
  EMAIL FRAMEWORK GUIDANCE:
  Use these proven frameworks to craft effective email campaigns:
  ${trainingConfig.copyFrameworks.emailFrameworks.map(framework => `
  • ${framework.name}: ${framework.description}
    Key Elements: ${framework.keyElements}`).join('')}
  
  FRAMEWORK APPLICATION:
  - Select the framework that aligns with your campaign goal
  - Incorporate all key elements for maximum impact
  - Adapt the framework to your specific audience and offer`;
}

export function buildSelectedMetaAdCopyFrameworksSection(
  trainingConfig: TrainingConfig,
  selectedFrameworks?: string | string[]
): string {
  if (!trainingConfig.copyFrameworks?.headlineFrameworks || !selectedFrameworks) {
    return '';
  }

  const selectedList = Array.isArray(selectedFrameworks)
    ? selectedFrameworks
    : [selectedFrameworks];
  const selectedSet = new Set(selectedList.map(name => name.toLowerCase()));

  const frameworks = trainingConfig.copyFrameworks.headlineFrameworks.filter(f =>
    selectedSet.has(f.name.toLowerCase())
  );

  if (frameworks.length === 0) {
    return '';
  }

  return `
  META AD COPY FRAMEWORK GUIDANCE (SELECTED):
  Use these selected frameworks to create focused ad copy variations:
  ${frameworks.map(framework => `
  • ${framework.name}: ${framework.description}
    Template: ${framework.template}
    ${framework.examples && framework.examples.length > 0 ? `Examples: ${framework.examples.slice(0, 2).join(', ')}` : ''}`).join('')}
  
  FRAMEWORK APPLICATION:
  - Create headlines using the selected frameworks for targeted testing
  - Match framework choice to the specific customer motivation being targeted
  - Ensure each headline serves a distinct strategic purpose`;
}

export function buildSelectedLandingPageFrameworksSection(
  trainingConfig: TrainingConfig,
  selectedFrameworks?: string | string[]
): string {
  if (!trainingConfig.copyFrameworks?.landingPageFrameworks || !selectedFrameworks) {
    return '';
  }

  const selectedList = Array.isArray(selectedFrameworks)
    ? selectedFrameworks
    : [selectedFrameworks];
  const selectedSet = new Set(selectedList.map(name => name.toLowerCase()));

  const frameworks = trainingConfig.copyFrameworks.landingPageFrameworks.filter(f =>
    selectedSet.has(f.name.toLowerCase()) || (f.displayName && selectedSet.has(f.displayName.toLowerCase()))
  );

  if (frameworks.length === 0) {
    return '';
  }

  return `
  ${frameworks.map(framework => `
  ${framework.name}: ${framework.description}
    Content Sequence: ${framework.contentSequence.join(' → ')}
    Reason Structure: ${framework.reasonStructure.join(', ')}
    Optimization Rules: ${framework.optimizationRules.join('; ')}
    ${framework.systemPrompt ? `System Prompt: ${framework.systemPrompt}` : ''}
    ${framework.realExamples && framework.realExamples.length > 0 ? `Examples: ${framework.realExamples.slice(0, 2).join(', ')}` : ''}
    ${framework.outputRequirements ? `CRITICAL OUTPUT REQUIREMENTS: ${framework.outputRequirements}` : ''}
    `).join('')}
    `;
}

export function buildSelectedEmailFrameworksSection(
  trainingConfig: TrainingConfig,
  selectedFrameworks?: string | string[]
): string {
  if (!trainingConfig.copyFrameworks?.emailFrameworks || !selectedFrameworks) {
    return '';
  }

  const selectedList = Array.isArray(selectedFrameworks)
    ? selectedFrameworks
    : [selectedFrameworks];
  const selectedSet = new Set(selectedList.map(name => name.toLowerCase()));

  const frameworks = trainingConfig.copyFrameworks.emailFrameworks.filter(f =>
    selectedSet.has(f.name.toLowerCase()) || (f.displayName && selectedSet.has(f.displayName.toLowerCase()))
  );

  if (frameworks.length === 0) {
    return '';
  }

  return `
  EMAIL FRAMEWORK GUIDANCE (SELECTED):
  Use these selected frameworks to craft effective email campaigns:
  ${frameworks.map(framework => `
  • ${framework.name}: ${framework.description}
    Key Elements: ${framework.keyElements}`).join('')}
  
  FRAMEWORK APPLICATION:
  - Select the framework that aligns with your campaign goal
  - Incorporate all key elements for maximum impact
  - Adapt the framework to your specific audience and offer`;
}

// Helper function to build comprehensive AI Settings context
export function buildAllBrandSettingsContext(trainingConfig: TrainingConfig, request: {
  persona?: string;
  selectedProduct?: string;
  selectedProducts?: string[];
  brandDrBalance?: number;
  useJonesBrandGuide?: boolean;
}) {
  const { persona: personaInput = '', selectedProduct = '', selectedProducts = [], brandDrBalance = DEFAULT_BRAND_DR_BALANCE, useJonesBrandGuide = DEFAULT_USE_JONES_BRAND_GUIDE } = request;

  // Handle optional personas - if persona is 'none' or empty, skip persona targeting

  let context = '';

  if (useJonesBrandGuide && trainingConfig) {
    context += buildBrandGuidelinesSection(trainingConfig);
    context += buildProductClaimsSection(trainingConfig, selectedProduct);
    context += buildMultiProductClaimsSection(trainingConfig, selectedProducts);
    context += buildPersonaPillarsSection(trainingConfig, personaInput);
  }

  context += buildBrandDrBalanceSection(brandDrBalance);
  context += buildBrandFirstGuidelinesSection(trainingConfig);
  context += buildDirectResponseGuidelinesSection(trainingConfig);
  context += '\n';

  return context;
}

// Individual section builders used by buildAllBrandSettingsContext
export function buildBrandGuidelinesSection(trainingConfig: TrainingConfig): string {
  if (!trainingConfig?.brandGuidelines) return '';
  let section = '';
  section += `Core Positioning: ${trainingConfig.brandGuidelines.corePositioning}\n\n`;

  if (trainingConfig.brandGuidelines.brandVoice) {
    section += 'Brand Voice Rules:\n';
    trainingConfig.brandGuidelines.brandVoice.forEach((rule, index) => {
      if (trainingConfig.brandGuidelines.enabledBrandVoice?.[index] !== false) {
        section += `- ${rule}\n`;
      }
    });
    section += '\n';
  }

  if (trainingConfig.brandGuidelines.keyTerminology) {
    section += 'Key Terms & Phrases:\n';
    trainingConfig.brandGuidelines.keyTerminology.forEach((term, index) => {
      if (trainingConfig.brandGuidelines.enabledKeyTerminology?.[index] !== false) {
        section += `- ${term}\n`;
      }
    });
    section += '\n';
  }

  if (trainingConfig.brandGuidelines.approvedLanguage) {
    section += 'Approved Language:\n';
    trainingConfig.brandGuidelines.approvedLanguage.forEach((phrase, index) => {
      if (trainingConfig.brandGuidelines.enabledApprovedLanguage?.[index] !== false) {
        section += `- ${phrase}\n`;
      }
    });
    section += '\n';
  }

  if (trainingConfig.brandGuidelines.avoidedLanguage) {
    section += 'Avoid These Phrases:\n';
    trainingConfig.brandGuidelines.avoidedLanguage.forEach((phrase, index) => {
      if (trainingConfig.brandGuidelines.enabledAvoidedLanguage?.[index] !== false) {
        section += `- ${phrase}\n`;
      }
    });
    section += '\n';
  }
  return section;
}

export function buildProductClaimsSection(trainingConfig: TrainingConfig, selectedProduct?: string): string {
  if (!selectedProduct) return '';
  const productClaims = trainingConfig.productClaims?.[selectedProduct];
  if (!productClaims) return '';

  let section = `PRODUCT-SPECIFIC CLAIMS FOR ${selectedProduct.toUpperCase()}:\n`;
  if (productClaims.approvedClaims && productClaims.approvedClaims.filter((_, index) => productClaims.enabledApproved?.[index] !== false).length > 0) {
    section += 'Approved Claims:\n';
    productClaims.approvedClaims.forEach((claim, index) => {
      if (productClaims.enabledApproved?.[index] !== false) {
        section += `- ${claim}\n`;
      }
    });
  }
  if (productClaims.prohibitedClaims && productClaims.prohibitedClaims.filter((_, index) => productClaims.enabledProhibited?.[index] !== false).length > 0) {
    section += 'Prohibited Claims (Never Use):\n';
    productClaims.prohibitedClaims.forEach((claim, index) => {
      if (productClaims.enabledProhibited?.[index] !== false) {
        section += `- ${claim}\n`;
      }
    });
  }
  section += '\n';
  return section;
}

export function buildMultiProductClaimsSection(trainingConfig: TrainingConfig, selectedProducts?: string[]): string {
  if (!selectedProducts || selectedProducts.length === 0 || !trainingConfig.productClaims) return '';
  let section = 'MULTI-PRODUCT CLAIMS:\n';
  selectedProducts.forEach((product) => {
    if (trainingConfig.productClaims![product]) {
      section += `${product.toUpperCase()}:\n`;
      const productClaims = trainingConfig.productClaims![product];
      if (productClaims.approvedClaims) {
        productClaims.approvedClaims.forEach((claim, index) => {
          if (productClaims.enabledApproved?.[index] !== false) {
            section += `  - ${claim}\n`;
          }
        });
      }
    }
  });
  section += '\n';
  return section;
}

export function buildPersonaPillarsSection(trainingConfig: TrainingConfig, personaInput?: string): string {
  if (!personaInput || personaInput === 'none') return '';
  const persona = trainingConfig.personaPillars?.[personaInput];
  if (!persona) return '';

  let section = `TARGET PERSONA - ${personaInput.toUpperCase()}:\n`;
  if (persona.description) {
    section += `Description: ${persona.description}\n`;
  }
  if (persona.pillars && persona.pillars.length > 0) {
    section += 'Key Pillars:\n';
    persona.pillars.forEach((pillar, index) => {
      if (persona.enabledPillars?.[index] !== false) {
        section += `- ${pillar}\n`;
      }
    });
  }
  section += '\n';
  return section;
}

export function buildBrandDrBalanceSection(brandDrBalance?: number): string {
  const brandPercent = brandDrBalance ?? DEFAULT_BRAND_DR_BALANCE;
  const drPercent = 100 - brandPercent;
  return `${brandPercent}% Brand Voice, ${drPercent}% Direct Response\n`;
}

export function buildBrandFirstGuidelinesSection(trainingConfig: TrainingConfig): string {
  const list = trainingConfig.copyFrameworks?.brandDrBalance?.brandFirst ?? [];
  const rules = list.filter((g) => g && g.trim() !== '');
  if (rules.length === 0) return '';
  let section = ``;
  rules.forEach((guideline) => {
    section += `- ${guideline}\n`;
  });
  return section;
}

export function buildDirectResponseGuidelinesSection(trainingConfig: TrainingConfig): string {
  const list = trainingConfig.copyFrameworks?.brandDrBalance?.directResponse ?? [];
  const rules = list.filter((g) => g && g.trim() !== '');
  if (rules.length === 0) return '';
  let section = ``;
  rules.forEach((guideline) => {
    section += `- ${guideline}\n`;
  });
  return section;
}