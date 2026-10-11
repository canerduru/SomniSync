import { liveEdgeFunctionService } from './live/LiveEdgeFunctionService';
import { ITranscriptionService, IInterpretationService, IImageService } from '../../types/services';

export const transcriptionService: ITranscriptionService = liveEdgeFunctionService;
export const interpretationService: IInterpretationService = liveEdgeFunctionService;
export const imageService: IImageService = liveEdgeFunctionService;
