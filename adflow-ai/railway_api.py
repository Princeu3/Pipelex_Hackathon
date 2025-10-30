#!/usr/bin/env python3
"""
Railway API - FastAPI wrapper for Pipelex workflows
Deploy this to Railway/Render/Fly.io for production Vercel deployment
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import asyncio
import logging
import os

# Import the AdGenerator
from scripts.ad_generator import AdGenerator

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(
    title="AdFlow AI - Pipelex API",
    description="Backend API for AdFlow AI product ad generation",
    version="1.0.0"
)

# CORS configuration - update with your Vercel domain
allowed_origins = [
    "http://localhost:3000",
    "https://your-app.vercel.app",  # Replace with actual domain
    os.getenv("FRONTEND_URL", "http://localhost:3000")
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, use allowed_origins list
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AdGenerator
generator = AdGenerator()


# Request/Response Models
class AdRequest(BaseModel):
    image_url: str
    product_info: Dict[str, Any]


class VideoRequest(BaseModel):
    video_prompt: str


class AnalyzeRequest(BaseModel):
    image_url: str
    product_info: Dict[str, Any]


# Health check endpoint
@app.get("/")
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "AdFlow AI API",
        "version": "1.0.0"
    }


# Generate complete ad
@app.post("/api/generate-ad")
async def generate_ad(request: AdRequest):
    """
    Generate complete product ad with analysis, copy, and video prompt
    """
    try:
        logger.info(f"Generating ad for product: {request.product_info.get('name', 'Unknown')}")
        
        result = await generator.generate_complete_ad(
            image_url=request.image_url,
            product_info=request.product_info
        )
        
        if not result["success"]:
            raise HTTPException(status_code=500, detail=result["error"])
        
        logger.info("Ad generation successful")
        return result
        
    except Exception as e:
        logger.error(f"Error generating ad: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Analyze product image
@app.post("/api/analyze-image")
async def analyze_image(request: AnalyzeRequest):
    """
    Analyze product image only
    """
    try:
        logger.info("Analyzing product image")
        
        result = await generator.analyze_product_image(
            image_url=request.image_url,
            product_info=request.product_info
        )
        
        if not result["success"]:
            raise HTTPException(status_code=500, detail=result["error"])
        
        logger.info("Image analysis successful")
        return result
        
    except Exception as e:
        logger.error(f"Error analyzing image: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Generate video
@app.post("/api/generate-video")
async def generate_video(request: VideoRequest):
    """
    Generate video from prompt using Veo 3 Fast
    """
    try:
        logger.info("Generating video")
        
        result = await generator.generate_video(
            video_prompt=request.video_prompt
        )
        
        if not result["success"]:
            raise HTTPException(status_code=500, detail=result["error"])
        
        logger.info("Video generation successful")
        return result
        
    except Exception as e:
        logger.error(f"Error generating video: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return {
        "success": False,
        "error": "Endpoint not found",
        "detail": str(exc)
    }


@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return {
        "success": False,
        "error": "Internal server error",
        "detail": str(exc)
    }


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    
    logger.info(f"Starting AdFlow AI API on port {port}")
    
    uvicorn.run(
        "railway_api:app",
        host="0.0.0.0",
        port=port,
        log_level="info",
        reload=False  # Set to True for development
    )

