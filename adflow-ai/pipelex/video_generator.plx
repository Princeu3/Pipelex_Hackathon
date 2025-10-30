################################################################################
# AdFlow AI - Video Generator Workflow
################################################################################
#
# This workflow generates cinematic product videos using Veo 3 Fast
#
# Features:
# - Takes video prompt as input
# - Generates 60-second product videos
# - Optimized for commercial content
# - Cost: $3.20 per video
#
################################################################################

domain = "video_generator"
description = "Generate cinematic product videos using Veo 3 Fast via Blackbox AI"
main_pipe = "generate_video"

################################################################################
# CONCEPTS
################################################################################

[concept.VideoPrompt]
description = "Detailed video generation prompt optimized for Veo 3"
refines = "Text"

[concept.VideoContent]
description = "Generated video URL and metadata"

################################################################################
# PIPES
################################################################################

[pipe]

[pipe.generate_video]
type = "PipeImgGen"
description = "Generate cinematic product video using Veo 3 Fast"
inputs = { prompt = "video_generator.VideoPrompt" }
output = "video_generator.VideoContent"
model = { model = "veo-3-fast" }
