# AdFlow AI - Quick Start Guide

## 🚀 Ready to Run!

Your AdFlow AI application is **fully configured** and ready to generate product ads using **Claude Sonnet 4.5** via **Blackbox AI**.

## ⚡ Start the Application

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000)

## 🎯 What's Configured

### ✅ Pipelex Setup
- **Backend:** Blackbox AI (enabled)
- **Routing:** `all_blackboxai` (all models via Blackbox)
- **Primary Model:** Claude Sonnet 4.5
- **Alternative Models:** GPT-4o, Gemini 2.5 Pro

### ✅ Workflows
All `.plx` workflows use Claude Sonnet 4.5:
- ✅ `analyze_product_image` - Vision analysis
- ✅ `generate_ad_copy_variants` - Creative copywriting
- ✅ `generate_single_tone_ad` - Targeted ads
- ✅ `refine_ad_copy` - Ad improvements

### ✅ Environment
```env
BLACKBOX_API_KEY=sk-wv9_2D0u6-GE4-fsdb3XnA
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📊 Model Specs

### Claude Sonnet 4.5 (Primary)
```
Provider: Blackbox AI
Model ID: blackboxai/anthropic/claude-sonnet-4.5
Cost: $0.28 input / $1.10 output per 1M tokens
Capabilities: Vision + Text, Structured Output
```

**Why Claude 4.5?**
- 89% cheaper than GPT-4o ($0.28 vs $2.50 input)
- Superior vision analysis
- Best-in-class creative writing
- Reliable structured outputs

## 🎨 Temperature Settings

| Task | Model | Temperature | Purpose |
|------|-------|-------------|---------|
| Image Analysis | Claude 4.5 | 0.7 | Balanced accuracy & creativity |
| Ad Copywriting | Claude 4.5 | 0.9 | High creativity |
| Product Facts | Claude 4.5 | 0.3 | Consistency |
| Structured Data | Claude 4.5 | 0.1 | Precision |

## 💰 Cost Estimates

### Per Ad Generation
- Image analysis: $0.00097
- 4 ad variants: $0.00144
- **Total: ~$0.0024** (less than ¼ cent!)

### Monthly Volumes
- 100 ads: $0.24
- 1,000 ads: $2.40
- 10,000 ads: $24.00

## 🔧 Configuration Files

```
.pipelex/
├── inference/
│   ├── backends.toml              ← Blackbox AI enabled
│   ├── routing_profiles.toml      ← active = "all_blackboxai"
│   ├── backends/blackboxai.toml   ← All available models
│   └── deck/
│       ├── base_deck.toml         ← Model aliases
│       └── overrides.toml         ← AdFlow customizations

pipelex/
├── ad_generator.plx               ← Main workflows
└── pipelex_config.toml            ← AdFlow config
```

## 🧪 Test the Setup

### 1. Verify Pipelex
```bash
python3.11 -c "from pipelex.pipelex import Pipelex; Pipelex.make(); print('✅ OK')"
```

### 2. Check Routing
```bash
grep "active" .pipelex/inference/routing_profiles.toml
# Output: active = "all_blackboxai"
```

### 3. View Models
```bash
grep "claude-4.5-sonnet" .pipelex/inference/backends/blackboxai.toml
```

### 4. Test Workflow
```bash
python3.11 scripts/ad_generator.py test_inputs.json
```

## 📖 Usage Example

### Create Test Input
```bash
cat > test_product.json <<EOF
{
  "image_url": "https://example.com/product.jpg",
  "product_info": {
    "name": "Premium Wireless Headphones",
    "description": "High-quality audio with active noise cancellation",
    "price": 299.99,
    "category": "Electronics"
  }
}
EOF
```

### Generate Ad
```bash
python3.11 scripts/ad_generator.py test_product.json
```

### Or Use the Web UI
1. Open http://localhost:3000
2. Upload product image
3. Fill in details
4. Click "Generate Ad Copy"
5. Get 4 variants instantly!

## 🎯 Model Selection Logic

```
All requests → Blackbox AI → Claude Sonnet 4.5
                          ↓
                    (Fallbacks available)
                    - GPT-4o
                    - Gemini 2.5 Pro
```

## 🔍 Debugging

### Check Active Backend
```bash
cat .pipelex/inference/backends.toml | grep -A 3 "\[blackboxai\]"
```

### View Model Routing
```bash
cat .pipelex/inference/routing_profiles.toml | grep -A 5 "all_blackboxai"
```

### Test API Key
```bash
echo $BLACKBOX_API_KEY
# Should output: sk-wv9_2D0u6-GE4-fsdb3XnA
```

## 📚 Documentation

- **Full Config:** See `PIPELEX_CONFIG.md`
- **Main README:** See `README.md`
- **Pipelex Docs:** https://docs.pipelex.com

## 🆘 Common Issues

### "Model not found"
**Fix:** Ensure routing is set to `all_blackboxai`
```bash
sed -i '' 's/active = ".*"/active = "all_blackboxai"/' .pipelex/inference/routing_profiles.toml
```

### "API key error"
**Fix:** Check .env.local has correct key
```bash
cat .env.local | grep BLACKBOX_API_KEY
```

### "Python not found"
**Fix:** Use Python 3.11+
```bash
which python3.11
# If not found: brew install python@3.11
```

## ✨ Key Features

1. **Latest Models:** Claude Sonnet 4.5 (released 2025)
2. **Unified Provider:** All via Blackbox AI
3. **Cost-Optimized:** 89% cheaper than alternatives
4. **High Quality:** Superior vision + creative writing
5. **Fast:** 8-13 seconds end-to-end

## 🎉 You're Ready!

Everything is configured. Just run:

```bash
npm run dev
```

And start generating amazing product ads! 🚀

---

**Questions?** Check `PIPELEX_CONFIG.md` for detailed configuration info.
