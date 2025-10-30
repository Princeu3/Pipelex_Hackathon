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
[concept.ProductImage]
description = "Product image input for analysis"
refines = "Image"

# Product Analysis Concept
[concept.ProductAnalysis]
description = "Comprehensive product analysis from image"

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
[concept.AdCopy]
description = "Marketing copy for advertisement"

[concept.AdCopy.structure]
headline = { type = "text", description = "8-12 word attention-grabbing headline", required = true }
tagline = { type = "text", description = "4-8 word memorable tagline", required = true }
body_text = { type = "text", description = "2-3 sentence description emphasizing benefits", required = true }
call_to_action = { type = "text", description = "2-4 word action-oriented CTA", required = true }
tone = { type = "text", description = "Copy tone description", required = true }

# Video Prompt Concept
[concept.VideoPrompt]
description = "Detailed video generation prompt for Veo-2"
refines = "Text"

# Complete Ad Content Concept
[concept.AdContent]
description = "Complete ad content package"

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
    { pipe = "analyze_product", result = "product_analysis" },
    { pipe = "generate_copy", result = "ad_copy" },
    { pipe = "create_video_prompt", result = "video_prompt" },
    { pipe = "combine_ad_content", result = "ad_content" }
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
prompt = """You are an expert product marketing analyst specializing in e-commerce and digital advertising. Analyze this product image to extract key marketing insights.

@product_image

Extract the following information as valid JSON:

1. **product_type**: Specific product category (e.g., "Wireless Bluetooth Headphones", "Premium Leather Handbag")

2. **key_features**: Observable visual features and attributes (comma-separated)
   - Physical design, materials, colors, unique elements
   - Focus on what makes this product distinctive

3. **target_audience**: Primary demographic profile
   - Age range, lifestyle, income level, interests
   - Example: "Tech-savvy professionals 25-40, urban lifestyle, mid-to-high income"

4. **use_case**: Primary value proposition and usage scenarios
   - What problem does it solve?
   - When and where would customers use it?

5. **selling_points**: Top 3-5 benefit-focused marketing angles (comma-separated)
   - Prioritize emotional benefits over technical features
   - What makes customers want to buy this?

6. **brand_vibe**: Select ONE that best fits: "luxury", "tech", "casual", "eco", "professional"
   - Base on product design, quality indicators, and target market

7. **dominant_colors**: 2-4 main visible colors (comma-separated, use common color names)

8. **style_aesthetic**: Overall visual style in 2-3 words (e.g., "minimalist modern", "classic elegant")

Return ONLY valid JSON matching the ProductAnalysis schema. Be specific and insights-driven.
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
prompt = """You are an expert e-commerce copywriter with a proven track record of creating high-converting product ads. Generate compelling ad copy based on this analysis:

Product Type: @product_analysis.product_type
Key Features: @product_analysis.key_features
Target Audience: @product_analysis.target_audience
Use Case: @product_analysis.use_case
Selling Points: @product_analysis.selling_points
Brand Vibe: @product_analysis.brand_vibe
Style: @product_analysis.style_aesthetic

Create ad copy that resonates emotionally, highlights key benefits, and drives conversion. Return as valid JSON:

1. **headline** (8-12 words):
   - Lead with the primary benefit or unique value proposition
   - Use power words that trigger emotion
   - Make it specific and compelling

2. **tagline** (4-8 words):
   - Memorable, punchy phrase that reinforces the headline
   - Should be quotable and brand-reinforcing

3. **body_text** (2-3 sentences, 40-80 words):
   - Focus on benefits and transformation, not just features
   - Appeal to the target audience's aspirations or pain points
   - Paint a picture of life with this product
   - End with momentum toward action

4. **call_to_action** (2-4 words):
   - Clear, action-oriented directive
   - Match brand vibe: luxury → "Discover Elegance", tech → "Get Yours", casual → "Shop Now", eco → "Make an Impact", professional → "Elevate Performance"

5. **tone**:
   - Brief description of copy tone (e.g., "Confident and aspirational", "Warm and inviting", "Bold and energetic")

Brand vibe guidelines:
- luxury: Exclusive, sophisticated, refined
- tech: Innovative, performance-driven, cutting-edge
- casual: Friendly, relatable, conversational
- eco: Conscious, authentic, purpose-driven
- professional: Competent, results-focused, authoritative

Return ONLY valid JSON. Every word must earn its place.
"""

################################################################################
# Step 3: Video Prompt Engineering
################################################################################

[pipe.create_video_prompt]
type = "PipeLLM"
description = "Engineer detailed video generation prompt optimized for Google Veo-2"
inputs = { product_analysis = "product_ad_generator.ProductAnalysis", ad_copy = "product_ad_generator.AdCopy" }
output = "product_ad_generator.VideoPrompt"
model = { model = "base-claude", temperature = 0.8 }
prompt = """You are a commercial video director specializing in product advertising. Create a detailed video prompt for Google Veo-3 that generates a professional 30-60 second product commercial.

PRODUCT ANALYSIS:
Product: @product_analysis.product_type
Key Features: @product_analysis.key_features
Brand Vibe: @product_analysis.brand_vibe
Colors: @product_analysis.dominant_colors
Style: @product_analysis.style_aesthetic

AD MESSAGE:
Headline: @ad_copy.headline
Tagline: @ad_copy.tagline
Tone: @ad_copy.tone

Create a single comprehensive video prompt (200-300 words) with this structure:

**OPENING (0-8s):**
- Establishing shot that captures attention immediately
- Environment that reflects brand vibe and target lifestyle
- Initial lighting mood
- Product introduction or reveal

**SHOWCASE (8-45s):**
- Dynamic camera work: specific movements (pan, zoom, orbit, dolly)
- Multiple product angles: hero shots, detail close-ups, context shots
- Product in use or interaction (if applicable)
- Highlight 2-3 key features visually
- Smooth transitions between shots

**ATMOSPHERE:**
- Lighting matching brand vibe:
  * luxury: dramatic, golden, elegant
  * tech: clean, bright, modern with cool tones
  * casual: warm, natural, inviting
  * eco: organic, natural daylight
  * professional: balanced, clear, authoritative
- Background: minimal but contextual
- Color palette: @product_analysis.dominant_colors

**CLOSING (45-60s):**
- Final hero shot: product perfectly composed and lit
- Slow camera movement for impact
- Text overlay with headline/tagline
- Fade to brand or product logo

**TECHNICAL:**
- 4K cinematic quality, professional color grading
- Smooth camera movements only
- Shallow depth of field for premium feel
- Pacing matches tone: @ad_copy.tone

Write as a single detailed paragraph in present tense. Be specific about every camera movement and lighting choice. Focus on visual storytelling that sells the product through imagery, not words.
"""

################################################################################
# Step 4: Combine Results
################################################################################

[pipe.combine_ad_content]
type = "PipeLLM"
description = "Combine all ad generation results into final AdContent structure"
inputs = { product_analysis = "product_ad_generator.ProductAnalysis", ad_copy = "product_ad_generator.AdCopy", video_prompt = "product_ad_generator.VideoPrompt" }
output = "product_ad_generator.AdContent"
model = { model = "base-claude", temperature = 0.3 }
prompt = """Format the provided data as a structured JSON object.

Product Analysis:
@product_analysis

Ad Copy:
@ad_copy

Video Prompt:
@video_prompt

Return JSON with these fields:
- product_analysis: ProductAnalysis as JSON string
- ad_copy: AdCopy as JSON string
- video_prompt: VideoPrompt text

Return ONLY valid JSON, no additional text."""

################################################################################
# End of Product Ad Generator Workflow
################################################################################
