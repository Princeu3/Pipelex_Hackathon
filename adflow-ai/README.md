# AdFlow AI - AI-Powered Product Ad Generator

An intelligent SaaS application that generates compelling product advertisements using AI-powered workflows built with Pipelex. Upload a product image, provide details, and instantly receive multiple ad copy variants with different tones and styles.

## Features

- **AI-Powered Image Analysis**: Advanced computer vision to understand product visual appeal
- **Multiple Ad Variants**: Generate 4 unique ad copies with different tones (professional, casual, enthusiastic, persuasive)
- **Structured Workflows**: Built with Pipelex for reliable, repeatable AI operations
- **Real-time Generation**: Fast ad copy creation powered by GPT-4
- **Export Functionality**: Download generated ads in JSON format
- **Beautiful UI**: Modern, responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **AI Workflows**: Pipelex (Python-based workflow engine)
- **LLM**: Claude Sonnet 4.5 via Blackbox AI (latest & most cost-effective)
- **Image Storage**: Vercel Blob
- **UI Components**: shadcn/ui, Lucide React icons, Sonner for notifications

### Why Claude Sonnet 4.5?

- **Superior Vision:** Excellent at analyzing product images
- **Creative Writing:** Best-in-class for persuasive ad copy
- **Cost-Effective:** $0.28/$1.10 per 1M tokens (89% cheaper than GPT-4o!)
- **Reliable:** Consistent structured outputs

## Project Structure

```
adflow-ai/
├── app/
│   ├── api/
│   │   ├── generate-ad/route.ts    # Main ad generation endpoint
│   │   └── analyze-image/route.ts   # Image analysis endpoint
│   ├── page.tsx                      # Main application page
│   ├── layout.tsx                    # Root layout
│   └── globals.css                   # Global styles
├── components/
│   ├── image-upload.tsx              # Image upload with drag & drop
│   ├── ad-generation-form.tsx        # Product info form
│   └── ad-preview.tsx                # Generated ads display
├── lib/
│   └── pipelex-client.ts             # Python workflow executor
├── pipelex/
│   └── ad_generator.plx              # Pipelex workflow definitions
├── scripts/
│   ├── ad_generator.py               # Python workflow implementation
│   └── workflow_executor.py          # CLI executor
├── types/
│   ├── ad-generation.ts              # TypeScript type definitions
│   └── pipelex.ts                    # Pipelex integration types
└── .pipelex/                         # Pipelex configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- BlackBox AI API key (or OpenAI API key)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd adflow-ai
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

3. **Install Python dependencies**
   ```bash
   pip3.11 install pipelex
   ```

4. **Configure environment variables**

   Create a `.env.local` file:
   ```env
   BLACKBOX_API_KEY=your-api-key-here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   OPENAI_API_KEY=your-api-key-here
   ```

5. **Initialize Pipelex** (Already configured!)

   The project is pre-configured to use Blackbox AI with Claude Sonnet 4.5:
   - ✅ Routing profile: `all_blackboxai`
   - ✅ Primary model: `claude-4.5-sonnet`
   - ✅ All workflows optimized for latest models

   To verify configuration:
   ```bash
   cat .pipelex/inference/routing_profiles.toml | grep active
   # Should show: active = "all_blackboxai"
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. **Upload Product Image**: Drag and drop or click to upload your product image
2. **Fill Product Details**: Enter product name, description, and optional fields (price, category, target audience)
3. **Generate Ads**: Click "Generate Ad Copy" button
4. **Review Results**: Browse through 4 different ad copy variants
5. **Copy or Export**: Copy individual variants or export all data as JSON

## Pipelex Workflows

The application uses three main Pipelex workflows defined in `pipelex/ad_generator.plx`:

### 1. Analyze Product Image
Analyzes uploaded product images to extract:
- Detailed visual description
- Dominant colors
- Key objects and elements
- Sentiment/mood
- Quality assessment
- Improvement suggestions

### 2. Generate Ad Copy Variants
Creates 4 unique ad copy variants with different tones:
- **Professional**: Formal, trustworthy, business-oriented
- **Casual**: Friendly, approachable, conversational
- **Enthusiastic**: Energetic, exciting, passionate
- **Persuasive**: Compelling, benefit-focused, conversion-driven

Each variant includes:
- Attention-grabbing headline
- Supporting subheadline
- Engaging body copy (50-100 words)
- Clear call-to-action

### 3. Generate Single Tone Ad
Generates a single ad variant with a specified tone for more targeted campaigns.

## API Endpoints

### POST /api/generate-ad
Generate complete ad with image analysis and copy variants

**Request**: FormData with:
- `image`: File (required)
- `productName`: string (required)
- `productDescription`: string (required)
- `productPrice`: number (optional)
- `productCategory`: string (optional)
- `productFeatures`: string (optional, comma-separated)
- `targetAudience`: string (optional)

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "ad_1234567890",
    "productInfo": { ... },
    "imageUrl": "https://...",
    "adCopy": [ ... ],
    "createdAt": "2025-10-29T...",
    "format": { ... }
  },
  "processingTime": 5432
}
```

### POST /api/analyze-image
Analyze product image only

**Request**: FormData with:
- `image`: File (required)
- `productName`: string (required)
- `productDescription`: string (required)

**Response**:
```json
{
  "success": true,
  "data": {
    "imageUrl": "https://...",
    "analysis": {
      "description": "...",
      "colors": "...",
      "objects": "...",
      "sentiment": "...",
      "quality": "high",
      "suggestions": "..."
    }
  },
  "processingTime": 2145
}
```

## Development

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## Configuration

### Pipelex Configuration
Located in `.pipelex/config.toml`:
```toml
[project]
name = "adflow-ai"
description = "AI-powered product ad generator"
version = "0.1.0"

[telemetry]
enabled = false

[paths]
libraries = ["pipelex"]
functions = ["scripts"]
```

### Backend Configuration
Located in `.pipelex/backends.toml` - configure which AI providers to use.

## Troubleshooting

### Python Module Not Found
Ensure Python 3.11+ is installed and Pipelex is installed:
```bash
python3.11 --version
pip3.11 install pipelex
```

### API Key Issues
Verify your API keys are set correctly in `.env.local` and that you've selected the right backend in Pipelex configuration.

### Image Upload Fails
Check that @vercel/blob is properly configured and you have write permissions.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Built with [Pipelex](https://pipelex.com) - Open-source language for AI workflows
- Powered by BlackBox AI for fast, reliable LLM inference
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)

## Support

For issues and questions:
- GitHub Issues: [Create an issue](../../issues)
- Pipelex Documentation: [https://docs.pipelex.com](https://docs.pipelex.com)

---

**Built for the Pipelex Hackathon** - Demonstrating the power of structured AI workflows for real-world applications.
