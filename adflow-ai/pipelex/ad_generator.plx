# AdFlow AI - Product Ad Generator Workflow
# Complete pipeline for analyzing product images and generating ad copy variants

domain = "adflow"
description = "AI-powered product ad generator for creating compelling ad copy from product images"
system_prompt = "You are an expert marketing copywriter and visual analyst specializing in creating compelling product advertisements."

# ===== CONCEPTS =====

[concept]
ProductInfo = "Information about a product including name, description, and target audience"
ProductImage = "A product image to be analyzed"
ImageAnalysis = "Analysis results of a product image"
AdCopyRequest = "Request for generating ad copy variants"
AdCopyVariant = "A single variant of ad copy with headline, body, and CTA"
AdCopyCollection = "Collection of multiple ad copy variants"

[concept.ProductInfo.structure]
name = { type = "text", description = "Product name", required = true }
description = { type = "text", description = "Product description", required = true }
price = { type = "number", description = "Product price", required = false }
category = { type = "text", description = "Product category", required = false }
features = { type = "text", description = "Comma-separated list of product features", required = false }
target_audience = { type = "text", description = "Target audience description", required = false }

[concept.ImageAnalysis.structure]
description = { type = "text", description = "Detailed description of the image", required = true }
colors = { type = "text", description = "Dominant colors in the image", required = true }
objects = { type = "text", description = "Objects identified in the image", required = true }
sentiment = { type = "text", description = "Overall sentiment/mood of the image", required = true }
quality = { type = "text", description = "Image quality assessment", required = true }
suggestions = { type = "text", description = "Suggestions for improving the product presentation", required = false }

[concept.AdCopyVariant.structure]
headline = { type = "text", description = "Attention-grabbing headline", required = true }
subheadline = { type = "text", description = "Supporting subheadline", required = false }
body = { type = "text", description = "Main ad copy body text", required = true }
call_to_action = { type = "text", description = "Call to action text", required = true }
tone = { type = "text", description = "Tone of the copy (professional, casual, enthusiastic, persuasive)", required = true }

# ===== PIPES =====

[pipe]

# Pipe 1: Analyze Product Image
[pipe.analyze_product_image]
type = "PipeLLM"
description = "Analyze a product image to extract visual features, colors, objects, and sentiment"
inputs = { image = "ProductImage", product_info = "ProductInfo" }
output = "ImageAnalysis"
model = { model = "claude-4.5-sonnet", temperature = 0.7 }
prompt = """
You are analyzing a product image to help create compelling advertisements.

Product Information:
- Name: @product_info.name
- Description: @product_info.description
@product_info.category? - Category: @product_info.category
@product_info.features? - Features: @product_info.features

Please analyze the provided product image and provide:

1. A detailed description of what you see in the image
2. The dominant colors present (list 3-5 colors)
3. Key objects and elements identified
4. The overall sentiment/mood conveyed by the image
5. An assessment of the image quality (high, medium, low)
6. Suggestions for how this product could be better presented visually

Format your response as a structured JSON with the following fields:
- description: (string) detailed visual description
- colors: (string) comma-separated list of dominant colors
- objects: (string) comma-separated list of key objects
- sentiment: (string) overall mood/sentiment
- quality: (string) quality assessment
- suggestions: (string) improvement suggestions

Image to analyze:
@image
"""

# Pipe 2: Generate Ad Copy Variants
[pipe.generate_ad_copy_variants]
type = "PipeLLM"
description = "Generate multiple compelling ad copy variants based on product info and image analysis"
inputs = { product_info = "ProductInfo", image_analysis = "ImageAnalysis" }
output = "AdCopyCollection"
model = { model = "claude-4.5-sonnet", temperature = 0.9 }
prompt = """
You are a world-class marketing copywriter creating compelling product advertisements.

Product Information:
- Name: @product_info.name
- Description: @product_info.description
@product_info.price? - Price: $@product_info.price
@product_info.category? - Category: @product_info.category
@product_info.features? - Features: @product_info.features
@product_info.target_audience? - Target Audience: @product_info.target_audience

Image Analysis:
- Visual Description: @image_analysis.description
- Colors: @image_analysis.colors
- Objects: @image_analysis.objects
- Sentiment: @image_analysis.sentiment
- Quality: @image_analysis.quality

Based on the product information and image analysis, create 4 different ad copy variants with different tones:

1. Professional tone - formal, trustworthy, business-oriented
2. Casual tone - friendly, approachable, conversational
3. Enthusiastic tone - energetic, exciting, passionate
4. Persuasive tone - compelling, benefit-focused, conversion-driven

For EACH variant, provide:
- headline: A powerful, attention-grabbing headline (5-10 words)
- subheadline: A supporting subheadline that adds context (10-15 words)
- body: Engaging body copy that highlights benefits and features (50-100 words)
- call_to_action: A clear, action-oriented CTA (2-5 words)
- tone: The tone used (professional, casual, enthusiastic, or persuasive)

Return your response as a JSON array of 4 objects, each containing the fields above.

IMPORTANT: Make the copy compelling, benefit-focused, and tailored to leverage the visual elements identified in the image analysis.
"""

# Pipe 3: Generate Single Tone Ad Copy
[pipe.generate_single_tone_ad]
type = "PipeLLM"
description = "Generate a single ad copy variant with a specific tone"
inputs = { product_info = "ProductInfo", image_analysis = "ImageAnalysis", tone = "Text" }
output = "AdCopyVariant"
model = { model = "claude-4.5-sonnet", temperature = 0.8 }
prompt = """
You are a world-class marketing copywriter creating a compelling product advertisement.

Product Information:
- Name: @product_info.name
- Description: @product_info.description
@product_info.price? - Price: $@product_info.price
@product_info.category? - Category: @product_info.category
@product_info.features? - Features: @product_info.features
@product_info.target_audience? - Target Audience: @product_info.target_audience

Image Analysis:
- Visual Description: @image_analysis.description
- Colors: @image_analysis.colors
- Sentiment: @image_analysis.sentiment

Desired Tone: @tone

Create an ad copy variant with the specified tone that includes:

1. headline: A powerful, attention-grabbing headline (5-10 words)
2. subheadline: A supporting subheadline (10-15 words)
3. body: Engaging body copy highlighting benefits (50-100 words)
4. call_to_action: A clear CTA (2-5 words)
5. tone: The tone specified above

Format your response as a JSON object with these exact fields.

Make the copy compelling and leverage the visual elements from the image analysis.
"""

# Pipe 4: Refine Ad Copy
[pipe.refine_ad_copy]
type = "PipeLLM"
description = "Refine and improve an existing ad copy variant"
inputs = { original_copy = "AdCopyVariant", feedback = "Text" }
output = "AdCopyVariant"
model = { model = "claude-4.5-sonnet", temperature = 0.7 }
prompt = """
You are refining an existing ad copy based on feedback.

Original Ad Copy:
- Headline: @original_copy.headline
- Subheadline: @original_copy.subheadline
- Body: @original_copy.body
- Call to Action: @original_copy.call_to_action
- Tone: @original_copy.tone

Feedback/Instructions:
@feedback

Please improve the ad copy while maintaining the same tone (@original_copy.tone) and addressing the feedback provided.

Return the refined version as a JSON object with the same structure:
- headline
- subheadline
- body
- call_to_action
- tone
"""
