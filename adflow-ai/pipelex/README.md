# Pipelex Workflows

This directory contains Pipelex workflow definitions (`.plx` files) for AdFlow AI.

## Workflows

### 1. ad_generator.plx
**Original Ad Copy Generator**
- Analyzes product images
- Generates 4 ad copy variants with different tones
- Produces headline, subheadline, body text, and CTA
- Optimized for e-commerce and social media ads

**Pipes:**
- `analyze_product_image` - Vision analysis of product
- `generate_ad_copy_variants` - Multi-tone ad copy generation
- `generate_single_tone_ad` - Targeted single variant
- `refine_ad_copy` - Ad copy improvement

### 2. product_ad_generator.plx ⭐ NEW
**Complete Video Ad Generator**
- Comprehensive product analysis from images
- Professional marketing copy generation
- Detailed video generation prompts for Veo-2
- End-to-end ad content pipeline

**Main Pipe:** `generate_ad_content` (PipeSequence)

**Sub-Pipes:**
1. `analyze_product` - Extract marketing insights from image
2. `generate_copy` - Create compelling ad copy
3. `create_video_prompt` - Engineer cinematic video prompts

**Concepts:**
- `ProductImage` - Input product image
- `ProductAnalysis` - Comprehensive analysis (8 fields)
- `AdCopy` - Marketing copy (5 components)
- `VideoPrompt` - Detailed Veo-2 prompt
- `AdContent` - Complete package

## Model Configuration

All workflows use **Claude Sonnet 4.5** via **Blackbox AI**:

```toml
model = { model = "base-claude", temperature = 0.7-0.9 }
```

**Model Details:**
- Full name: `claude-4.5-sonnet`
- Provider: Blackbox AI
- Capabilities: Vision + Text, Structured Output
- Cost: $0.28 input / $1.10 output per 1M tokens

## Temperature Settings

| Task | Temperature | Rationale |
|------|-------------|-----------|
| Product Analysis | 0.7 | Balanced creativity & accuracy |
| Ad Copywriting | 0.9 | High creativity |
| Video Prompts | 0.8 | Creative but structured |
| Ad Refinement | 0.7 | Balanced improvements |

## Usage

### Python Execution

```python
import asyncio
from pipelex.pipelex import Pipelex
from pipelex.pipeline.execute import execute_pipeline
from pipelex.core.stuffs.image_content import ImageContent

# Initialize
Pipelex.make()

# Execute workflow
async def generate_ad():
    result = await execute_pipeline(
        pipe_code="generate_ad_content",
        inputs={
            "product_image": ImageContent(url="product.jpg")
        }
    )
    return result.main_stuff_as_dict()

# Run
ad_content = asyncio.run(generate_ad())
```

### CLI Execution

```bash
# Using the Python scripts
python3.11 scripts/ad_generator.py input.json

# Or directly with Pipelex CLI
pipelex run pipelex/product_ad_generator.plx --inputs input.json
```

## Input Format

### For ad_generator.plx

```json
{
  "product_info": {
    "name": "Premium Wireless Headphones",
    "description": "High-quality audio with ANC",
    "price": 299.99,
    "category": "Electronics"
  },
  "image_url": "https://example.com/product.jpg"
}
```

### For product_ad_generator.plx

```json
{
  "product_image": {
    "url": "https://example.com/product.jpg"
  }
}
```

## Output Format

### ProductAnalysis

```json
{
  "product_type": "Wireless Bluetooth Headphones",
  "key_features": "sleek design, metallic finish, premium materials",
  "target_audience": "Tech-savvy professionals aged 25-40",
  "use_case": "Daily commute and travel",
  "selling_points": "comfort, sound quality, connectivity",
  "brand_vibe": "tech",
  "dominant_colors": "matte black, silver accents",
  "style_aesthetic": "minimalist modern"
}
```

### AdCopy

```json
{
  "headline": "Experience Studio-Quality Sound Wherever Life Takes You",
  "tagline": "Premium Audio. Zero Wires.",
  "body_text": "Immerse yourself in crystal-clear sound...",
  "call_to_action": "Shop Now",
  "tone": "Confident and aspirational"
}
```

### VideoPrompt

A detailed 250-400 word cinematic prompt optimized for Veo-2, including:
- Opening sequence (0-10s)
- Product showcase (10-40s)
- Atmospheric elements
- Closing sequence (40-60s)
- Technical specifications

## Configuration Files

- `.pipelex/inference/backends.toml` - Backend settings
- `.pipelex/inference/routing_profiles.toml` - Model routing
- `.pipelex/inference/deck/base_deck.toml` - Model aliases
- `.pipelex/inference/deck/overrides.toml` - Custom presets

## Best Practices

1. **Use base-claude alias** - Automatically routes to Claude 4.5
2. **Set appropriate temperature** - Higher for creative tasks
3. **Validate structured output** - Check JSON schema compliance
4. **Monitor costs** - Track token usage via Blackbox dashboard
5. **Test iteratively** - Use lower temperatures for testing

## Troubleshooting

### "Model not found"
Ensure routing is set to `all_blackboxai` in routing_profiles.toml

### "API key error"
Check `.env` file has `BLACKBOX_API_KEY` set

### "Concept not found"
Use fully qualified concept names: `domain.ConceptName`

### "Temperature out of range"
Valid range: 0.0 to 2.0 (recommended: 0.1 to 1.0)

## Documentation

- **Pipelex Docs:** https://docs.pipelex.com
- **PLX Syntax:** https://docs.pipelex.com/pages/writing-workflows
- **Blackbox AI:** https://blackbox.ai

---

**Last Updated:** 2025-10-29
**Pipelex Version:** 0.14.3
**Primary Model:** Claude Sonnet 4.5
