#!/usr/bin/env python3
"""
AdFlow AI - Ad Generator Script
Executes Pipelex workflows for generating product ads
"""

import asyncio
import json
import sys
from pathlib import Path
from typing import Dict, Any, Optional
from pipelex.pipeline.execute import execute_pipeline
from pipelex.pipelex import Pipelex
from pipelex.core.stuffs.image_content import ImageContent
from pipelex.core.stuffs.stuff_factory import StuffFactory


class AdGenerator:
    """Ad generator using Pipelex workflows"""

    def __init__(self):
        """Initialize Pipelex"""
        self.pipelex = Pipelex.make()

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
                    "image": ImageContent(url=image_url),
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
        Complete pipeline: analyze image and generate ad copy

        Args:
            image_url: URL or path to the product image
            product_info: Dictionary containing product information

        Returns:
            Dictionary containing complete ad generation results
        """
        try:
            # Step 1: Analyze the image
            analysis_result = await self.analyze_product_image(
                image_url=image_url,
                product_info=product_info
            )

            if not analysis_result["success"]:
                return analysis_result

            image_analysis = analysis_result["data"]

            # Step 2: Generate ad copy variants
            variants_result = await self.generate_ad_copy_variants(
                product_info=product_info,
                image_analysis=image_analysis
            )

            if not variants_result["success"]:
                return variants_result

            # Combine results
            return {
                "success": True,
                "data": {
                    "image_analysis": image_analysis,
                    "ad_variants": variants_result["data"],
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
