#!/usr/bin/env python3
"""
Workflow Executor
Generic script for executing any Pipelex workflow via API calls
"""

import asyncio
import json
import sys
import logging
from pathlib import Path
from typing import Dict, Any
from ad_generator import AdGenerator

# Configure logging to stderr to prevent interference with JSON output
logging.basicConfig(
    level=logging.WARNING,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=sys.stderr
)


async def execute_workflow(workflow_name: str, inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Execute a Pipelex workflow

    Args:
        workflow_name: Name of the workflow to execute
        inputs: Input data for the workflow

    Returns:
        Execution results
    """
    generator = AdGenerator()

    if workflow_name == "analyze_product_image":
        return await generator.analyze_product_image(
            image_url=inputs.get("image_url"),
            product_info=inputs.get("product_info")
        )

    elif workflow_name == "generate_ad_copy_variants":
        return await generator.generate_ad_copy_variants(
            product_info=inputs.get("product_info"),
            image_analysis=inputs.get("image_analysis")
        )

    elif workflow_name == "generate_complete_ad":
        return await generator.generate_complete_ad(
            image_url=inputs.get("image_url"),
            product_info=inputs.get("product_info")
        )

    elif workflow_name == "generate_single_tone_ad":
        return await generator.generate_single_tone_ad(
            product_info=inputs.get("product_info"),
            image_analysis=inputs.get("image_analysis"),
            tone=inputs.get("tone", "professional")
        )

    elif workflow_name == "generate_video":
        return await generator.generate_video(
            video_prompt=inputs.get("video_prompt")
        )

    else:
        return {
            "success": False,
            "data": None,
            "error": f"Unknown workflow: {workflow_name}"
        }


async def main():
    """Main function for API integration"""
    # Read from stdin for API calls
    input_data = json.loads(sys.stdin.read())

    workflow_name = input_data.get("workflow_name")
    inputs = input_data.get("inputs", {})

    # Save original stdout
    original_stdout = sys.stdout
    
    try:
        # Redirect stdout to stderr during workflow execution
        # This prevents Pipelex's log messages from interfering with JSON output
        sys.stdout = sys.stderr
        
        result = await execute_workflow(workflow_name, inputs)
        
        # Restore stdout before printing result
        sys.stdout = original_stdout
        
        # Output JSON to stdout (only this line should go to stdout)
        print(json.dumps(result), flush=True)
        
    except Exception as e:
        # Restore stdout in case of error
        sys.stdout = original_stdout
        print(json.dumps({
            "success": False,
            "data": None,
            "error": f"Workflow execution failed: {str(e)}"
        }), flush=True)


if __name__ == "__main__":
    asyncio.run(main())
