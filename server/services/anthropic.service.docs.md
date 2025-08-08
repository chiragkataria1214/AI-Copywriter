# Anthropic Service (`anthropic.ts`) Documentation

This document provides a detailed overview of the AI content generation "stations" available in `server/services/anthropic.ts`. Each station is a function designed for a specific content generation task, leveraging different request parameters and context sections to build prompts for the Anthropic API.

## Core Concepts

### Stations
A "station" is an exported function that handles a specific type of content generation (e.g., `generateAdCopy`, `generateLandingPageCopy`). Each station has a unique name (e.g., `adCopy`, `landingPage`) used to retrieve configuration from the `trainingConfig` object.

### `trainingConfig`
This is a crucial object passed to most stations. It contains brand guidelines, product information, persona details, pre-defined prompt templates, and other settings that ensure the generated content is on-brand and tailored to specific requirements. It's fetched from the database.

### Context Sections
To create effective prompts, stations build various "context sections". These are strings containing specific information (e.g., about the target audience, products, or brand voice). They are constructed using helper functions (like `buildTargetPersonaSection`) and injected into the system and user prompts.

### `StationPromptManager`
This is a helper class responsible for building system and user prompts using templates from the `trainingConfig` and injecting the relevant context sections. This allows for dynamic and configurable prompt engineering.

---

## Context Section Details

Here is a detailed explanation of each helper function that builds a context section. These sections are dynamically injected into the prompts sent to the AI.

### `buildTargetPersonaSection`
- **What it is**: Creates a detailed block of text describing the target audience for the content.
- **How it's used**: This section is fundamental for tailoring the tone, language, and messaging of the generated content to a specific customer segment.
- **Contents**:
    - `TARGET PERSONA`: The name of the main persona (e.g., "Skintellectual").
    - `Description`: A general description of the persona.
    - `SUBPERSONA`: If a subpersona is specified (e.g., "Skintellectual:Acne-Prone"), it adds the subpersona's name and description.
    - `Key Targeting Pillars`: A bulleted list of key characteristics, interests, or pain points of the persona/subpersona (e.g., "Loves clean beauty," "Wants multi-use products").
    - `PERSONA-SPECIFIC TARGETING REQUIREMENTS`: A list of instructions for the AI, reminding it to tailor the copy directly to this audience.

### `buildSelectedProductsSection`
- **What it is**: Generates a section focused on the specific product(s) to be featured in the content.
- **How it's used**: This ensures that the AI uses accurate, on-brand, and compliant language when discussing products.
- **Contents**:
    - `PRODUCT FOCUS`: Identifies the primary and/or selected products by their display names.
    - `PRODUCT-SPECIFIC CLAIMS`: For each selected product, this provides:
        - `Approved Claims (USE THESE)`: A list of marketing claims that are approved for use.
        - `Prohibited Claims (NEVER USE)`: A list of claims that must not be used, ensuring compliance.
    - `PRODUCT-SPECIFIC REQUIREMENTS`: A set of rules for the AI on how to feature the products, such as using only approved claims and creating product-focused calls-to-action.

### `buildAISettingsContext`
- **What it is**: A comprehensive context block that aggregates several key pieces of brand and product information.
- **How it's used**: This acts as a master guide for the AI, providing a wide range of brand rules in one place.
- **Contents**:
    - `JONES ROAD BEAUTY BRAND GUIDELINES`:
        - `Core Positioning`: The brand's core marketing message.
        - `Brand Voice Rules`: Guidelines on the brand's tone and style.
        - `Key Terms & Phrases`: Specific terminology to use.
        - `Approved Language`: Phrases that are encouraged.
        - `Avoid These Phrases`: Phrases to avoid.
    - `PRODUCT-SPECIFIC CLAIMS`: Similar to `buildSelectedProductsSection`, it includes approved and prohibited claims for the selected product(s).
    - `TARGET PERSONA`: A summary of the target persona, including description and key pillars.
    - `BRAND/DR BALANCE`: Specifies the desired balance between brand-focused storytelling and direct-response marketing (e.g., "80% Brand Voice, 20% Direct Response").
    - `BRAND-FIRST` & `DIRECT RESPONSE GUIDELINES`: Provides specific rules for the AI to follow based on the Brand/DR balance.

### `buildLandingPageContext`
- **What it is**: Fetches and summarizes the text content from a given landing page URL.
- **How it's used**: Used in `generateAdCopy` to ensure the ad's messaging is consistent with the page it links to, creating a seamless user experience.
- **Contents**:
    - `LANDING PAGE CONTEXT`: The extracted text from the URL.
    - `FUNNEL ALIGNMENT REQUIREMENT`: An instruction to the AI to align the ad copy with the landing page content to reduce bounce rates.

### `buildCopyFrameworksSection` (and variants)
- **What it is**: Provides the AI with a set of proven copywriting formulas to use for generating content. There are variants for `headlineFrameworks`, `landingPageFrameworks`, and `emailFrameworks`.
- **How it's used**: This guides the AI to create diverse, structured, and effective copy based on established marketing principles.
- **Contents**:
    - `HEADLINE FRAMEWORK GUIDANCE`: Lists various headline frameworks (e.g., "Benefit-Driven," "Social Proof").
        - `Name`, `Description`, `Template`, and `Examples` for each framework.
    - `FRAMEWORK APPLICATION`: Instructions on how and when to apply different frameworks.

### `buildCustomBriefSection`
- **What it is**: A simple section that injects a user-provided custom brief into the prompt.
- **How it's used**: Allows for on-the-fly, specific instructions to guide a particular content generation request.
- **Contents**:
    - `CUSTOM BRIEF FOR THIS GENERATION`: The user's text.
    - `PRIORITY INSTRUCTION`: A reminder to the AI to prioritize this custom brief.

### `ContentContextBuilder` Class
This class contains several methods for building more advanced, dynamic context sections.

- **`buildImageAnalysisContext`**:
    - **What it is**: Creates a prompt section for analyzing a visual asset (an uploaded image or an image at a URL).
    - **How it's used**: Enables the AI to "see" an image and generate copy that is relevant to the visual content.
    - **Contents**: `VISUAL CONTENT ANALYSIS` header and instructions for the AI on how to use the visual information.

- **`buildTranscriptionContext`**:
    - **What it is**: Formats a provided text transcription for the AI.
    - **How it's used**: Allows the AI to generate copy based on the content of a video or audio file.
    - **Contents**: A header indicating the content type (e.g., `VIDEO TRANSCRIPTION`) and the transcription text itself, with instructions to extract key messages and hooks.

---

## How to Use Variables in Prompt Templates

To control the final prompt sent to the AI, you can use a templating system within your station's `userPromptTemplate` (defined in the database via the UI). This allows you to precisely place the content from request parameters and the context sections you've enabled.

The system uses a **Handlebars-like syntax**.

### 1. Accessing Request Variables

Any variable passed in the request to a station function is directly available in your template. You can insert its value using double curly braces: `{{variableName}}`.

**Example**: For the `generateAdCopy` station, the `AdCopyRequest` object contains `customBrief`, `persona`, and `transcription`. You can use them like this:

```handlebars
Based on the following brief: {{customBrief}}

And this transcription: {{transcription}}

Please generate ad copy for the {{persona}} persona.
```

### 2. Including Context Sections

This is the most powerful feature. Each context section you enable for a station has a unique **ID** (e.g., `target_persona`, `selected_products`). You can inject the entire generated content of a section into your template using the `{{sections.section_id}}` syntax.

This gives you full control over the final structure of the prompt.

**Example**: Let's build a `userPromptTemplate` for the `adCopy` station that explicitly places the persona and product information.

```handlebars
**Primary Task:** Generate 3 headlines and 1 primary text for a Facebook ad.

**Custom Instructions:**
{{#if customBrief}}
{{customBrief}}
{{else}}
No custom brief provided. Follow standard instructions.
{{/if}}

---
**Contextual Information**

{{{sections.target_persona}}}

{{{sections.selected_products}}}

{{{sections.image_analysis}}}

---
**Creative Source Material**

{{{sections.transcription_context}}}
```

**Explanation:**
- `{{#if customBrief}}...{{/if}}`: This is a conditional block. The text inside will only be included if `customBrief` has a value.
- `{{{sections.target_persona}}}`: This injects the entire output of the `buildTargetPersonaSection` function at this exact spot. We use triple braces `{{{...}}}` to prevent HTML-escaping, ensuring the formatted text from the section is inserted as-is.
- By arranging the `{{{sections...}}}` placeholders, you control the order and structure of the final user prompt.

### 3. System Prompts vs. User Prompts

- **`systemPrompt`**: This is typically a high-level set of instructions that defines the AI's role and personality (e.g., "You are an expert social media marketer for Jones Road Beauty..."). Currently, **it does not support templating**. It's a static piece of text. The `buildAISettingsContext` is often programmatically added *after* the system prompt in the code, not through templating.
- **`userPromptTemplate`**: This is where you should use templates to structure the specific task for the AI, including all the dynamic context. This is the main place to use `{{variable}}` and `{{{sections.section_id}}}`.

### 4. Available Variables Per Station

Here is a complete list of all `{{variableName}}` placeholders you can use in the `userPromptTemplate` for each specific station.

#### 1. `reviseContent`
Note: These variables are accessed through the `context` object in the request.
- `{{context.transcription}}`
- `{{context.customBrief}}`
- `{{context.persona}}`
- `{{context.targetAudience}}`
- `{{context.brandDrBalance}}`
- `{{context.selectedProduct}}`
- `{{context.selectedProducts}}` (This is an array)
- `{{context.field}}`
- `{{context.customRequest}}`
- `{{context.useJonesBrandGuide}}`

#### 2. `generateAdCopy`
- `{{transcription}}`
- `{{customBrief}}`
- `{{persona}}`
- `{{landingPageUrl}}`
- `{{brandDrBalance}}`
- `{{useJonesBrandGuide}}`
- `{{airLink}}`
- `{{uploadedImage}}` (Contains the base64 string of the image)
- `{{selectedProduct}}`
- `{{selectedProducts}}` (Array of product keys)

#### 3. `generateLandingPageCopy`
- `{{landingPageType}}`
- `{{productBrief}}`
- `{{persona}}`
- `{{useAdsContent}}`
- `{{adsContent}}`
- `{{brandDrBalance}}`
- `{{selectedProduct}}`
- `{{selectedProducts}}` (Array of product keys)
- `{{mainAngle}}`
- `{{transcription}}`

#### 4. `analyzeStaticAd`
- `{{staticAdImage}}` (Contains the base64 string of the image)
- `{{persona}}`
- `{{brandDrBalance}}`
- `{{selectedProduct}}`
- `{{selectedProducts}}` (Array of product keys)
- `{{useJonesBrandGuide}}`
- `{{outputFormat}}`
- `{{analysisFocus}}`

#### 5. `generateCustomCopy`
- `{{customRequest}}`
- `{{persona}}`
- `{{brandDrBalance}}`
- `{{selectedProduct}}`
- `{{selectedProducts}}` (Array of product keys)
- `{{useJonesBrandGuide}}`

#### 6. `generateRetentionCopy`
- `{{keyMessage}}`
- `{{platform}}`
- `{{emailType}}`
- `{{selectedFramework}}` (This is an object; you can access its properties like `{{selectedFramework.displayName}}`)
- `{{selectedProducts}}` (Array of product keys)
- `{{audience}}`
- `{{goal}}`
- `{{campaignType}}`
- `{{contentLength}}`
- `{{keywordsToInclude}}` (Array of strings)
- `{{wordsToAvoid}}` (Array of strings)
- `{{persona}}`
- `{{brandDrBalance}}`
- `{{selectedProduct}}`
- `{{useJonesBrandGuide}}`

#### 7. `generateSocialCaptions`
- `{{contentType}}`
- `{{transcription}}`
- `{{platform}}`
- `{{goal}}`
- `{{tone}}`
- `{{variations}}`
- `{{selectedProduct}}`
- `{{selectedProducts}}` (Array of product keys)
- `{{persona}}`
- `{{imageData}}` (Contains the base64 string of the image)

#### 8. `generateStorySequence`
- `{{contentType}}`
- `{{transcription}}`
- `{{sequenceType}}`
- `{{length}}`
- `{{tone}}`
- `{{selectedProduct}}`
- `{{selectedProducts}}` (Array of product keys)
- `{{persona}}`
- `{{imageData}}` (Contains the base64 string of the image)

#### 9. `generateBrief`
- `{{notes}}`
- `{{googleDriveLinks}}` (Array of strings)
- `{{selectedProduct}}`
- `{{selectedProducts}}` (Array of product keys)
- `{{persona}}`
- `{{brandDrBalance}}`
- `{{useJonesBrandGuide}}`

#### 10. `generateRetentionVisualPreview`
- `{{copyContent}}`
- `{{platform}}`
- `{{emailType}}`
- `{{selectedFramework}}` (This is an object)

By using this template system, you can create highly customized and effective prompts without changing the underlying service code.

### 5. Available Context Sections Per Station

Here is a station-by-station guide to the most relevant `{{{sections.section_id}}}` placeholders. While you can technically enable any section for any station, these are the ones enabled by default or most commonly used.

#### `adCopy`
- `{{{sections.transcription_context}}}`: For content sourced from video/audio.
- `{{{sections.target_persona}}}`: Essential for targeting the ad copy.
- `{{{sections.image_analysis}}}`: To generate copy relevant to the ad creative.
- `{{{sections.copy_frameworks}}}`: Provides headline formulas.
- `{{{sections.selected_products}}}`: To include product-specific claims.
- `{{{sections.custom_brief}}}`: For specific, one-off instructions.

#### `landingPage`
- `{{{sections.target_persona}}}`: To tailor the page's messaging.
- `{{{sections.landing_page_frameworks}}}`: Provides structure for the entire page.
- `{{{sections.selected_products}}}`: For detailing product benefits and claims.
- `{{{sections.transcription_context}}}`: If the page is based on a video's content.

#### `customRequest`
- This station is highly flexible. The most common sections are:
- `{{{sections.target_persona}}}`
- `{{{sections.selected_products}}}`
- `{{{sections.custom_brief}}}`

#### `staticAd`
- `{{{sections.target_persona}}}`: To create relevant ad variations.
- `{{{sections.image_analysis}}}`: The core of this station is analyzing an image.
- `{{{sections.selected_products}}}`: If the ad features specific products.

#### `emailSmsRetention`
- `{{{sections.target_persona}}}`: For personalizing the message.
- `{{{sections.email_frameworks}}}`: Provides structure and best practices for email/SMS.
- `{{{sections.selected_products}}}`: To feature products in the message.

#### `socialCaptions` & `storySequences`
- `{{{sections.transcription_context}}}`: If sourcing from video/audio.
- `{{{sections.image_analysis}}}`: If sourcing from an image.
- `{{{sections.target_persona}}}`: To ensure the tone and content are relatable.
- `{{{sections.selected_products}}}`: To naturally weave in products.

#### Advanced & Global Sections
These can be enabled on any station for more control:
- `{{{sections.ai_settings_context}}}`: A large block with brand guidelines, claims, and personas. Use with caution to avoid duplicating information.
- `{{{sections.station_enhancements}}}`: Adds station-specific best practices.
- `{{{sections.quality_guidelines}}}`: Adds general quality standards.
- `{{{sections.output_instructions}}}`: Crucial for forcing a specific output format like JSON.
