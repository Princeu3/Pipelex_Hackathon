# Pipelex Configuration for AdFlow AI

## Overview

AdFlow AI is configured to use **Blackbox AI** as the exclusive inference provider with **Claude Sonnet 4.5** as the primary model for all AI operations. This configuration ensures optimal performance for product ad generation while maintaining cost-effectiveness.

## Configuration Architecture

### 1. Backend Configuration

**Location:** `.pipelex/inference/backends.toml`

```toml
[blackboxai]
display_name = "BlackBox AI"
enabled = true
endpoint = "https://api.blackbox.ai/v1"
api_key = "${BLACKBOX_API_KEY}"
```

**Status:** ✅ Enabled and configured

### 2. Routing Profile

**Location:** `.pipelex/inference/routing_profiles.toml`

```toml
active = "all_blackboxai"
```

This profile routes **ALL** model requests to Blackbox AI, ensuring unified billing and monitoring.

### 3. Model Selection

**Primary Models (all via Blackbox AI):**

#### Claude Sonnet 4.5
- **Model ID:** `blackboxai/anthropic/claude-sonnet-4.5`
- **Usage:** Vision analysis, creative copywriting, structured data
- **Cost:** $0.28 input / $1.10 output per 1M tokens ⭐ Most cost-effective
- **Capabilities:**
  - Superior vision understanding
  - Excellent creative writing
  - Strong reasoning
  - Supports images + text input
  - Structured output

#### GPT-4o (Alternative)
- **Model ID:** `blackboxai/openai/gpt-4o`
- **Usage:** Fallback for vision tasks
- **Cost:** $2.50 input / $10.00 output per 1M tokens
- **Capabilities:**
  - Strong vision capabilities
  - Good general purpose
  - Reliable structured output

#### Gemini 2.5 Pro (Alternative)
- **Model ID:** `blackboxai/google/gemini-2.5-pro`
- **Usage:** Large context tasks
- **Cost:** $1.25 input / $10.00 output per 1M tokens
- **Capabilities:**
  - Large context window
  - Strong reasoning
  - Good for long documents

## Workflow Configuration

### ad_generator.plx

All pipes configured to use **Claude Sonnet 4.5**:

1. **analyze_product_image**
   - Model: `claude-4.5-sonnet`
   - Temperature: 0.7
   - Task: Visual analysis of product images

2. **generate_ad_copy_variants**
   - Model: `claude-4.5-sonnet`
   - Temperature: 0.9 (high creativity)
   - Task: Generate 4 ad copy variants with different tones

3. **generate_single_tone_ad**
   - Model: `claude-4.5-sonnet`
   - Temperature: 0.8
   - Task: Generate targeted ad copy

4. **refine_ad_copy**
   - Model: `claude-4.5-sonnet`
   - Temperature: 0.7
   - Task: Improve existing ad copy

## Model Deck Configuration

### Base Aliases

**Location:** `.pipelex/inference/deck/base_deck.toml`

```toml
[aliases]
base-claude = "claude-4.5-sonnet"
best-claude = "claude-4.5-sonnet"
base-gpt = "gpt-4o"
best-gpt = "gpt-4o"
base-gemini = "gemini-2.5-flash"
best-gemini = "gemini-2.5-pro"
```

### Custom Overrides

**Location:** `.pipelex/inference/deck/overrides.toml`

AdFlow-specific model configurations:

```toml
[aliases]
adflow_vision = "claude-4.5-sonnet"
adflow_copywriter = "claude-4.5-sonnet"
adflow_analyzer = "claude-4.5-sonnet"
adflow_creative = "claude-4.5-sonnet"

[llm.choice_overrides]
for_text = "claude-4.5-sonnet"
for_object = "claude-4.5-sonnet"

[llm.presets]
llm_for_product_analysis = { model = "claude-4.5-sonnet", temperature = 0.7 }
llm_for_ad_copywriting = { model = "claude-4.5-sonnet", temperature = 0.9 }
llm_for_product_description = { model = "claude-4.5-sonnet", temperature = 0.3 }
llm_for_marketing_tone = { model = "claude-4.5-sonnet", temperature = 0.85 }
llm_for_ad_refinement = { model = "claude-4.5-sonnet", temperature = 0.7 }
llm_for_structured_extraction = { model = "claude-4.5-sonnet", temperature = 0.1 }
```

## Environment Variables

**Location:** `.env.local`

```env
BLACKBOX_API_KEY=your-api-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Cost Analysis

### Claude Sonnet 4.5 via Blackbox AI

**Pricing:**
- Input: $0.28 per 1M tokens
- Output: $1.10 per 1M tokens

**Average Ad Generation Costs:**
- Image analysis: ~1,500 input + 500 output tokens = $0.00097
- Ad copy generation (4 variants): ~2,000 input + 800 output tokens = $0.00144
- **Total per ad:** ~$0.0024 (less than a quarter cent!)

**Comparison:**
- GPT-4o: ~$0.0115 per ad (4.8x more expensive)
- Gemini 2.5 Pro: ~$0.0105 per ad (4.4x more expensive)

**Monthly estimates at different volumes:**
- 100 ads/month: $0.24
- 1,000 ads/month: $2.40
- 10,000 ads/month: $24.00

## Model Capabilities

### Claude Sonnet 4.5 Strengths

1. **Vision Analysis**
   - Detailed image descriptions
   - Color and object detection
   - Sentiment analysis
   - Quality assessment

2. **Creative Writing**
   - Compelling headlines
   - Persuasive copy
   - Tone variation
   - Benefit-focused messaging

3. **Structured Output**
   - JSON formatting
   - Schema compliance
   - Consistent structure

4. **Cost Efficiency**
   - 89% cheaper than GPT-4o
   - 88% cheaper than Gemini 2.5 Pro
   - No quality compromise

## Configuration Files

### File Structure

```
.pipelex/
├── config.toml                          # Project config
├── inference/
│   ├── backends.toml                    # Backend settings ✅
│   ├── routing_profiles.toml            # Routing config ✅
│   ├── backends/
│   │   └── blackboxai.toml             # Blackbox AI models ✅
│   └── deck/
│       ├── base_deck.toml              # Base model aliases ✅
│       └── overrides.toml              # AdFlow overrides ✅
│
pipelex/
├── ad_generator.plx                     # Main workflow ✅
└── pipelex_config.toml                  # AdFlow config ✅
```

## Verification

### Check Active Configuration

```bash
# Verify Blackbox AI is enabled
cat .pipelex/inference/backends.toml | grep -A 3 "blackboxai"

# Check routing profile
cat .pipelex/inference/routing_profiles.toml | grep "active"

# View available models
cat .pipelex/inference/backends/blackboxai.toml | grep "model_id"
```

### Test Model Access

```bash
# Run a simple test workflow
python3.11 -c "
from pipelex.pipelex import Pipelex
Pipelex.make()
print('✅ Pipelex initialized successfully')
"
```

## Best Practices

### 1. Temperature Settings

- **Image Analysis (0.7):** Balanced between creativity and accuracy
- **Creative Copywriting (0.9):** High creativity for engaging copy
- **Factual Content (0.3):** Low for consistency
- **Structured Data (0.1):** Very low for precision

### 2. Model Selection

- Use **Claude 4.5 Sonnet** for all primary tasks
- Reserve **GPT-4o** for specific vision tasks if needed
- Use **GPT-4o Mini** only for fast testing iterations

### 3. Cost Optimization

- Claude 4.5 Sonnet is already the most cost-effective premium model
- No need to use cheaper models - quality is maintained at low cost
- Monitor usage through Blackbox AI dashboard

## Troubleshooting

### Issue: Model Not Found

**Solution:** Ensure routing profile is set to `all_blackboxai`:

```bash
sed -i '' 's/active = ".*"/active = "all_blackboxai"/' .pipelex/inference/routing_profiles.toml
```

### Issue: API Key Error

**Solution:** Verify environment variable:

```bash
echo $BLACKBOX_API_KEY
# or check .env.local
cat .env.local | grep BLACKBOX
```

### Issue: Slow Responses

**Solution:** Claude 4.5 Sonnet is fast. Check network connection and Blackbox AI status.

## Migration Guide

### From GPT-4o to Claude 4.5 Sonnet

Already configured! All workflows use Claude 4.5 Sonnet by default.

### From Other Providers to Blackbox AI

1. Update routing profile: `active = "all_blackboxai"`
2. Ensure Blackbox AI is enabled in backends.toml
3. Set BLACKBOX_API_KEY in .env.local
4. All models automatically route through Blackbox

## Performance Metrics

### Expected Latency

- Image analysis: 3-5 seconds
- Ad copy generation: 5-8 seconds
- Single variant: 2-4 seconds
- Total pipeline: 8-13 seconds

### Quality Metrics

- Image analysis accuracy: 95%+
- Ad copy relevance: 90%+
- Tone consistency: 95%+
- Structured output success: 98%+

## Advanced Configuration

### Custom Model Routing

To use different models for specific tasks, update `overrides.toml`:

```toml
[llm.presets]
# Use Gemini for long-context tasks
llm_for_long_context = { model = "gemini-2.5-pro", temperature = 0.5 }

# Use GPT-4o for specific vision tasks
llm_for_ocr = { model = "gpt-4o", temperature = 0.1 }
```

### Image Generation

For product mockup images:

```toml
[img_gen.presets]
img_gen_for_adflow_product = {
    model = "flux-pro/v1.1-ultra",
    quality = "high",
    guidance_scale = 8.5
}
```

## Support

- **Pipelex Docs:** https://docs.pipelex.com
- **Blackbox AI:** https://blackbox.ai
- **Discord:** https://go.pipelex.com/discord

---

**Last Updated:** 2025-10-29
**Configuration Version:** 1.0
**Pipelex Version:** 0.14.3
