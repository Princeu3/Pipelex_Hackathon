#!/usr/bin/env python3
"""
AdFlow AI - Ad Generator Script
Executes Pipelex workflows for generating product ads
"""

import asyncio
import json
import sys
import os
import base64
import logging
from pathlib import Path
from typing import Dict, Any, Optional
from pipelex.pipeline.execute import execute_pipeline
from pipelex.pipelex import Pipelex
from pipelex.core.stuffs.image_content import ImageContent
from pipelex.core.stuffs.stuff_factory import StuffFactory

# Configure logging to go to stderr instead of stdout
# This prevents log messages from interfering with JSON output on stdout
logging.basicConfig(
    level=logging.WARNING,  # Set to WARNING to reduce noise
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=sys.stderr
)

# Also configure Pipelex loggers to use stderr
for logger_name in ['pipelex', 'pipelex.pipeline', 'pipelex.core']:
    logger = logging.getLogger(logger_name)
    logger.setLevel(logging.WARNING)
    for handler in logger.handlers[:]:
        logger.removeHandler(handler)
    handler = logging.StreamHandler(sys.stderr)
    handler.setLevel(logging.WARNING)
    logger.addHandler(handler)

# Initialize Pipelex at module level
# Change to project root so Pipelex can find .pipelex/config.toml
PROJECT_ROOT = Path(__file__).parent.parent
os.chdir(PROJECT_ROOT)

# Initialize Pipelex (will load libraries from .pipelex/config.toml)
Pipelex.make()


class AdGenerator:
    """Ad generator using Pipelex workflows"""

    def __init__(self):
        """Initialize workflow paths"""
        # Pipelex is already initialized at module level
        workflow_dir = PROJECT_ROOT / "pipelex"
        
        # Store paths
        self.project_root = PROJECT_ROOT
        self.product_ad_workflow = workflow_dir / "product_ad_generator.plx"
        self.video_workflow = workflow_dir / "video_generator.plx"

    async def analyze_product_image(
        self,
        image_url: str,
        product_info: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Analyze a product image using Pipelex workflow

        Args:
            image_url: URL or path to the product image
            product_info: Dictionary containing product information

        Returns:
            Dictionary containing image analysis results
        """
        try:
            # Convert image to base64 data URI if it's a local file
            processed_image_url = image_url
            if not image_url.startswith(('http://', 'https://', 'data:')):
                # Handle relative paths starting with /
                if image_url.startswith('/'):
                    # Convert to absolute path relative to public directory
                    image_path = self.project_root / "public" / image_url.lstrip('/')
                else:
                    image_path = Path(image_url)
                
                if image_path.exists():
                    # Read image and convert to base64
                    with open(image_path, 'rb') as img_file:
                        img_data = img_file.read()
                        img_base64 = base64.b64encode(img_data).decode('utf-8')
                        
                        # Determine image type from extension
                        ext = image_path.suffix.lower()
                        mime_types = {
                            '.jpg': 'image/jpeg',
                            '.jpeg': 'image/jpeg',
                            '.png': 'image/png',
                            '.gif': 'image/gif',
                            '.webp': 'image/webp'
                        }
                        mime_type = mime_types.get(ext, 'image/jpeg')
                        
                        # Create data URI
                        processed_image_url = f"data:{mime_type};base64,{img_base64}"
            
            # Create product info stuff
            product_stuff = StuffFactory.make_from_concept_string(
                concept_string="adflow.ProductInfo",
                name="product_info",
                content=product_info
            )

            # Execute the image analysis pipeline
            pipe_output = await execute_pipeline(
                pipe_code="analyze_product_image",
                inputs={
                    "image": ImageContent(url=processed_image_url),
                    "product_info": product_stuff.content
                }
            )

            # Extract the analysis results
            analysis = pipe_output.main_stuff_as_dict()

            return {
                "success": True,
                "data": analysis,
                "error": None
            }

        except Exception as e:
            return {
                "success": False,
                "data": None,
                "error": str(e)
            }

    async def generate_ad_copy_variants(
        self,
        product_info: Dict[str, Any],
        image_analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate multiple ad copy variants

        Args:
            product_info: Dictionary containing product information
            image_analysis: Dictionary containing image analysis results

        Returns:
            Dictionary containing ad copy variants
        """
        try:
            # Create stuff objects
            product_stuff = StuffFactory.make_from_concept_string(
                concept_string="adflow.ProductInfo",
                name="product_info",
                content=product_info
            )

            analysis_stuff = StuffFactory.make_from_concept_string(
                concept_string="adflow.ImageAnalysis",
                name="image_analysis",
                content=image_analysis
            )

            # Execute the ad copy generation pipeline
            pipe_output = await execute_pipeline(
                pipe_code="generate_ad_copy_variants",
                inputs={
                    "product_info": product_stuff.content,
                    "image_analysis": analysis_stuff.content
                }
            )

            # Extract the ad variants
            ad_variants = pipe_output.main_stuff_as_dict()

            return {
                "success": True,
                "data": ad_variants,
                "error": None
            }

        except Exception as e:
            return {
                "success": False,
                "data": None,
                "error": str(e)
            }

    async def generate_complete_ad(
        self,
        image_url: str,
        product_info: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Complete pipeline using product_ad_generator.plx workflow
        Generates comprehensive product analysis, ad copy, and video prompt

        Args:
            image_url: URL or path to the product image
            product_info: Dictionary containing product information (optional, not used in new workflow)

        Returns:
            Dictionary containing complete ad generation results
        """
        try:
            # Load the PLX bundle content
            with open(self.product_ad_workflow, 'r', encoding='utf-8') as f:
                plx_content = f.read()
            
            # Convert image to base64 data URI if it's a local file
            if not image_url.startswith(('http://', 'https://', 'data:')):
                # Handle relative paths starting with /
                if image_url.startswith('/'):
                    # Convert to absolute path relative to public directory
                    image_path = self.project_root / "public" / image_url.lstrip('/')
                else:
                    image_path = Path(image_url)
                
                if image_path.exists():
                    # Read image and convert to base64
                    with open(image_path, 'rb') as img_file:
                        img_data = img_file.read()
                        img_base64 = base64.b64encode(img_data).decode('utf-8')
                        
                        # Determine image type from extension
                        ext = image_path.suffix.lower()
                        mime_types = {
                            '.jpg': 'image/jpeg',
                            '.jpeg': 'image/jpeg',
                            '.png': 'image/png',
                            '.gif': 'image/gif',
                            '.webp': 'image/webp'
                        }
                        mime_type = mime_types.get(ext, 'image/jpeg')
                        
                        # Create data URI
                        image_url = f"data:{mime_type};base64,{img_base64}"
            
            # Execute the complete ad generation pipeline using product_ad_generator.plx
            # This workflow only needs the product image as input
            pipe_output = await execute_pipeline(
                plx_content=plx_content,
                inputs={
                    "product_image": ImageContent(url=image_url)
                }
            )

            # Extract the complete results
            # Access the main_stuff which contains the AdContent
            ad_content = pipe_output.main_stuff
            
            # The content is stored in the .content attribute of the Stuff object
            content_data = ad_content.content
            
            # Extract the three fields - they are attributes, not dict keys
            product_analysis_str = getattr(content_data, 'product_analysis', "{}")
            ad_copy_str = getattr(content_data, 'ad_copy', "{}")
            video_prompt_str = getattr(content_data, 'video_prompt', "")
            
            # Parse JSON strings
            try:
                product_analysis = json.loads(product_analysis_str) if isinstance(product_analysis_str, str) else product_analysis_str
            except:
                product_analysis = {}
            
            try:
                ad_copy = json.loads(ad_copy_str) if isinstance(ad_copy_str, str) else ad_copy_str
            except:
                ad_copy = {}

            return {
                "success": True,
                "data": {
                    "product_analysis": product_analysis,
                    "ad_copy": ad_copy,
                    "video_prompt": video_prompt_str,
                    "product_info": product_info,
                    "image_url": image_url
                },
                "error": None
            }

        except Exception as e:
            return {
                "success": False,
                "data": None,
                "error": str(e)
            }

    async def generate_single_tone_ad(
        self,
        product_info: Dict[str, Any],
        image_analysis: Dict[str, Any],
        tone: str
    ) -> Dict[str, Any]:
        """
        Generate a single ad copy with specific tone

        Args:
            product_info: Dictionary containing product information
            image_analysis: Dictionary containing image analysis results
            tone: Desired tone (professional, casual, enthusiastic, persuasive)

        Returns:
            Dictionary containing single ad copy variant
        """
        try:
            # Create stuff objects
            product_stuff = StuffFactory.make_from_concept_string(
                concept_string="adflow.ProductInfo",
                name="product_info",
                content=product_info
            )

            analysis_stuff = StuffFactory.make_from_concept_string(
                concept_string="adflow.ImageAnalysis",
                name="image_analysis",
                content=image_analysis
            )

            # Execute the single tone ad generation pipeline
            pipe_output = await execute_pipeline(
                pipe_code="generate_single_tone_ad",
                inputs={
                    "product_info": product_stuff.content,
                    "image_analysis": analysis_stuff.content,
                    "tone": tone
                }
            )

            # Extract the ad variant
            ad_variant = pipe_output.main_stuff_as_dict()

            return {
                "success": True,
                "data": ad_variant,
                "error": None
            }

        except Exception as e:
            return {
                "success": False,
                "data": None,
                "error": str(e)
            }

    async def generate_video(
        self,
        video_prompt: str
    ) -> Dict[str, Any]:
        """
        Generate a product video using Veo 3 Fast

        Args:
            video_prompt: Detailed video generation prompt (max 2000 chars)

        Returns:
            Dictionary containing video URL and generation results
        """
        try:
            # Load the PLX bundle content
            with open(self.video_workflow, 'r', encoding='utf-8') as f:
                plx_content = f.read()
            
            # Truncate prompt to 2000 characters
            truncated_prompt = video_prompt[:2000]

            # Execute the video generation pipeline
            pipe_output = await execute_pipeline(
                plx_content=plx_content,
                inputs={
                    "prompt": truncated_prompt
                }
            )

            # Extract the video results
            video_result = pipe_output.main_stuff
            
            # Get the content from the Stuff object
            if hasattr(video_result, 'content'):
                content = video_result.content
                # Try to get URL from content
                if hasattr(content, 'url'):
                    video_url = content.url
                elif hasattr(content, 'model_dump'):
                    video_dict = content.model_dump()
                    video_url = video_dict.get("url") or video_dict.get("video_url")
                else:
                    video_url = None
            else:
                video_url = None

            return {
                "success": True,
                "data": {
                    "video_url": video_url,
                    "prompt": truncated_prompt
                },
                "error": None
            }

        except Exception as e:
            return {
                "success": False,
                "data": None,
                "error": str(e)
            }


async def main():
    """Main function for CLI usage"""
    if len(sys.argv) < 2:
        print("Usage: python ad_generator.py <input_json_file>")
        sys.exit(1)

    input_file = Path(sys.argv[1])

    if not input_file.exists():
        print(f"Error: Input file {input_file} not found")
        sys.exit(1)

    # Load input data
    with open(input_file, 'r', encoding='utf-8') as f:
        input_data = json.load(f)

    # Create generator
    generator = AdGenerator()

    # Generate ad
    result = await generator.generate_complete_ad(
        image_url=input_data.get("image_url"),
        product_info=input_data.get("product_info")
    )

    # Print results
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
