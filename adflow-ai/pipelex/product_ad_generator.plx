################################################################################
# Product Ad Generator - Main Workflow
################################################################################
# Generate professional video ad content from product images using Blackbox AI
# Optimized for Claude Sonnet 4.5 vision and creative capabilities
################################################################################

domain = "product_ad_generator"
description = "Generate professional video ad content from product images using Blackbox inference"
main_pipe = "generate_ad_content"
system_prompt = "You are an expert product marketing and video production AI assistant, specialized in creating compelling advertising content."

################################################################################
# CONCEPTS
################################################################################

# Input Concept
[concept]
ProductImage = "Product image input for analysis"

[concept.ProductImage]
refines = "Image"

# Product Analysis Concept
[concept]
ProductAnalysis = "Comprehensive product analysis from image"

[concept.ProductAnalysis.structure]
product_type = { type = "text", description = "Product category and type", required = true }
key_features = { type = "text", description = "Visual features list (comma-separated)", required = true }
target_audience = { type = "text", description = "Target demographic description", required = true }
use_case = { type = "text", description = "Primary use scenario", required = true }
selling_points = { type = "text", description = "Marketing angles (comma-separated)", required = true }
brand_vibe = { type = "text", description = "Brand tone: luxury, tech, casual, eco, professional", required = true }
dominant_colors = { type = "text", description = "Main colors visible (comma-separated)", required = true }
style_aesthetic = { type = "text", description = "Overall visual style", required = true }

# Ad Copy Concept
[concept]
AdCopy = "Marketing copy for advertisement"

[concept.AdCopy.structure]
headline = { type = "text", description = "8-12 word attention-grabbing headline", required = true }
tagline = { type = "text", description = "4-8 word memorable tagline", required = true }
body_text = { type = "text", description = "2-3 sentence description emphasizing benefits", required = true }
call_to_action = { type = "text", description = "2-4 word action-oriented CTA", required = true }
tone = { type = "text", description = "Copy tone description", required = true }

# Video Prompt Concept
[concept]
VideoPrompt = "Detailed video generation prompt for Veo-2"

[concept.VideoPrompt]
refines = "Text"

# Complete Ad Content Concept
[concept]
AdContent = "Complete ad content package"

[concept.AdContent.structure]
product_analysis = { type = "text", description = "Product analysis JSON", required = true }
ad_copy = { type = "text", description = "Ad copy JSON", required = true }
video_prompt = { type = "text", description = "Video generation prompt", required = true }

################################################################################
# PIPES
################################################################################

[pipe]

################################################################################
# Main Orchestration Pipe
################################################################################

[pipe.generate_ad_content]
type = "PipeSequence"
description = "Main pipeline orchestrating all ad generation steps"
inputs = { product_image = "product_ad_generator.ProductImage" }
output = "product_ad_generator.AdContent"
steps = [
    { pipe = "analyze_product", inputs = { product_image = "product_image" }, result = "product_analysis" },
    { pipe = "generate_copy", inputs = { product_analysis = "product_analysis" }, result = "ad_copy" },
    { pipe = "create_video_prompt", inputs = { product_analysis = "product_analysis", ad_copy = "ad_copy" }, result = "video_prompt" }
]

################################################################################
# Step 1: Product Analysis
################################################################################

[pipe.analyze_product]
type = "PipeLLM"
description = "Analyze product image using Claude Sonnet 4.5 vision model"
inputs = { product_image = "product_ad_generator.ProductImage" }
output = "product_ad_generator.ProductAnalysis"
model = { model = "base-claude", temperature = 0.7 }
prompt = """You are an expert product analyst and marketing strategist with deep expertise in visual analysis and consumer psychology.

Analyze this product image in comprehensive detail:

@product_image

Your task is to extract all relevant marketing and advertising information. Think like a marketing director planning a major product launch.

Identify and return in structured JSON format:

1. **product_type**: The specific product category and type (e.g., "Wireless Bluetooth Headphones", "Premium Leather Handbag", "Ergonomic Office Chair")

2. **key_features**: List the key visual features and attributes you can observe (comma-separated)
   - Physical characteristics, design elements, materials, colors, textures
   - Example: "sleek design, metallic finish, compact size, premium materials, modern aesthetics"

3. **target_audience**: Describe the target demographic based on the product style, features, and positioning
   - Include: age range, interests, income level, lifestyle
   - Example: "Tech-savvy professionals aged 25-40, urban lifestyle, values quality and design, mid-to-high income"

4. **use_case**: Explain the primary use scenario and value proposition
   - Where, when, and how would someone use this?
   - What problem does it solve?
   - Example: "Daily commute and travel, wireless freedom for active lifestyle, noise-free focus during work"

5. **selling_points**: Top 3-5 marketing angles that would resonate with the target audience (comma-separated)
   - Focus on benefits, not just features
   - Example: "All-day comfort, premium sound quality, seamless connectivity, long battery life, stylish design"

6. **brand_vibe**: Choose ONE that best matches the product aesthetic and target market
   - Options: "luxury", "tech", "casual", "eco", "professional"
   - Consider: price positioning, design language, target audience expectations

7. **dominant_colors**: List 2-4 main colors visible in the product (comma-separated)
   - Use common color names
   - Example: "matte black, silver accents, deep blue"

8. **style_aesthetic**: Describe the overall visual style in 2-3 words
   - Example: "minimalist modern", "bold sporty", "classic elegant", "industrial rugged"

Return your analysis as valid JSON matching the ProductAnalysis schema. Be specific and actionable - this data will drive the entire ad creation process.
"""

################################################################################
# Step 2: Ad Copy Generation
################################################################################

[pipe.generate_copy]
type = "PipeLLM"
description = "Generate compelling marketing copy using Claude Sonnet 4.5"
inputs = { product_analysis = "product_ad_generator.ProductAnalysis" }
output = "product_ad_generator.AdCopy"
model = { model = "base-claude", temperature = 0.9 }
prompt = """You are an award-winning advertising copywriter specializing in e-commerce and product marketing. You've created campaigns for major brands and understand how to drive conversions through compelling copy.

Based on this comprehensive product analysis:

Product Type: @product_analysis.product_type
Key Features: @product_analysis.key_features
Target Audience: @product_analysis.target_audience
Use Case: @product_analysis.use_case
Selling Points: @product_analysis.selling_points
Brand Vibe: @product_analysis.brand_vibe
Dominant Colors: @product_analysis.dominant_colors
Style Aesthetic: @product_analysis.style_aesthetic

Create advertising copy that:
✓ Speaks directly to the target audience's desires and pain points
✓ Highlights the most compelling selling points
✓ Matches the identified brand vibe perfectly
✓ Creates emotional connection and urgency
✓ Drives immediate action

Generate the following copy elements as valid JSON:

1. **headline** (8-12 words):
   - Attention-grabbing and benefit-focused
   - Use power words and emotional triggers
   - Clear value proposition
   - Example format: "Experience [benefit] with [product] - [unique angle]"

2. **tagline** (4-8 words):
   - Memorable and punchy
   - Reinforces the core message
   - Should be quotable and shareable
   - Example format: "[Unique benefit]. [Emotional payoff]."

3. **body_text** (2-3 sentences):
   - Emphasize benefits over features
   - Appeal to emotions and aspirations
   - Include social proof concept if relevant to brand vibe
   - Paint a vivid picture of product ownership
   - End with a subtle push toward action

4. **call_to_action** (2-4 words):
   - Action-oriented and urgent
   - Match the brand vibe (luxury: "Discover Now", tech: "Upgrade Today", casual: "Shop Now", eco: "Join the Movement")
   - Create FOMO (fear of missing out) if appropriate

5. **tone**:
   - Describe the overall tone used (e.g., "Confident and aspirational", "Warm and friendly", "Bold and energetic")
   - Should align with brand_vibe

Copy guidelines by brand vibe:
- **luxury**: Exclusive, refined, sophisticated language. Focus on craftsmanship, prestige, timeless value
- **tech**: Innovation-focused, cutting-edge, performance-driven. Use technical credibility mixed with accessibility
- **casual**: Friendly, relatable, conversational. Focus on everyday moments and easy living
- **eco**: Conscious, authentic, impactful. Emphasize sustainability, responsibility, positive change
- **professional**: Confident, competent, reliable. Focus on results, efficiency, career advancement

Return valid JSON matching the AdCopy schema. Make every word count - this copy needs to convert browsers into buyers.
"""

################################################################################
# Step 3: Video Prompt Engineering
################################################################################

[pipe.create_video_prompt]
type = "PipeLLM"
description = "Engineer detailed video generation prompt optimized for Google Veo-2"
inputs = {
    product_analysis = "product_ad_generator.ProductAnalysis",
    ad_copy = "product_ad_generator.AdCopy"
}
output = "product_ad_generator.VideoPrompt"
model = { model = "base-claude", temperature = 0.8 }
prompt = """You are an expert video director and cinematographer with 20+ years of experience creating award-winning product commercials. You specialize in crafting detailed technical prompts for AI video generation models like Google Veo-2.

Create a detailed 60-second product advertisement video prompt using this information:

PRODUCT ANALYSIS:
Product Type: @product_analysis.product_type
Key Features: @product_analysis.key_features
Target Audience: @product_analysis.target_audience
Use Case: @product_analysis.use_case
Selling Points: @product_analysis.selling_points
Brand Vibe: @product_analysis.brand_vibe
Dominant Colors: @product_analysis.dominant_colors
Style Aesthetic: @product_analysis.style_aesthetic

AD COPY:
Headline: @ad_copy.headline
Tagline: @ad_copy.tagline
Body Text: @ad_copy.body_text
Call-to-Action: @ad_copy.call_to_action
Tone: @ad_copy.tone

Your task is to write a single, comprehensive video generation prompt (250-400 words) that creates a cinematic, professional product commercial. Structure it chronologically through 60 seconds:

**OPENING SEQUENCE (0-10 seconds):**
- Initial establishing shot with specific camera position and angle
- Scene environment matching brand vibe and target audience
- Lighting introduction that sets the mood
- Product reveal moment

**PRODUCT SHOWCASE (10-40 seconds):**
- Dynamic camera movements: specify panning direction and speed, zoom depth, rotation angles, dolly shots
- Multiple product angles: hero shots, detail close-ups, 360-degree views, feature highlights
- Movement and interaction: show product in use, hands interacting naturally, realistic scenarios
- Smooth cinematic transitions between shots (cut, dissolve, match cut)
- Emphasize key features visually: @product_analysis.key_features

**ATMOSPHERIC ELEMENTS (throughout):**
- Lighting style matching brand vibe:
  * luxury: dramatic side lighting, golden hour glow, elegant shadows
  * tech: clean crisp lighting, subtle blue tones, minimalist brightness
  * casual: natural warm lighting, soft diffusion, approachable brightness
  * eco: natural daylight, organic shadows, earth-tone warmth
  * professional: balanced even lighting, confidence-inspiring clarity
- Color grading using dominant colors: @product_analysis.dominant_colors
- Background environment details: props, surfaces, contexts that enhance product story
- Visual effects only if they enhance the product (light rays, subtle particles, bokeh)

**CLOSING SEQUENCE (40-60 seconds):**
- Final hero shot composition: product centered, perfectly lit
- Slow camera pull-back or gentle rotation for grandeur
- Text overlay moments:
  * Headline appears: @ad_copy.headline (45-50 sec)
  * Tagline/CTA appears: @ad_copy.tagline / @ad_copy.call_to_action (55-58 sec)
- Fade to brand screen or product logo

**TECHNICAL SPECIFICATIONS:**
- Camera: 4K cinematic quality, 24fps feel, professional color depth
- Movement speed: smooth and controlled, never jarring
- Focus: rack focus between product details, shallow depth of field for premium look
- Pacing: match the @ad_copy.tone - energetic=faster cuts, luxury=slower lingering shots
- Style aesthetic: @product_analysis.style_aesthetic

**CRITICAL REQUIREMENTS:**
✓ Every camera movement must be explicitly specified (e.g., "slow pan left to right", "zoom in from wide to medium close-up")
✓ Describe lighting quality precisely (soft/dramatic/bright/moody)
✓ Include time markers for key moments
✓ Match visual style to brand vibe: @product_analysis.brand_vibe
✓ Naturally incorporate dominant colors: @product_analysis.dominant_colors
✓ Professional commercial aesthetic - TV-quality production values
✓ Focus on VISUAL and CINEMATIC details, not marketing copy
✓ Make it feel like a premium brand commercial

Output your response as a single detailed paragraph optimized for Veo-2 video generation. Write in present tense, descriptive language. Think like you're briefing a cinematographer for a million-dollar commercial shoot.
"""

################################################################################
# End of Product Ad Generator Workflow
################################################################################
