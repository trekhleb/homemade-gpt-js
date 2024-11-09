import { ModelVariant } from './types';

export const CONFIG: Record<ModelVariant, { nLayer: number, nHead: number, nEmbd: number, blockSize: number }> = {
  // Tiny models
  'gpt-pico':     { nLayer: 2,  nHead: 2,  nEmbd: 16,   blockSize: 16 },
  'gpt-nano':     { nLayer: 3,  nHead: 3,  nEmbd: 48,   blockSize: 32 },
  'gpt-micro':    { nLayer: 4,  nHead: 4,  nEmbd: 128,  blockSize: 128 },
  'gpt-mini':     { nLayer: 6,  nHead: 6,  nEmbd: 192,  blockSize: 256 },
  
  // GPT-1
  'openai-gpt':   { nLayer: 12, nHead: 12, nEmbd: 768,  blockSize: 512 }, // 117M params

  // GPT-2 configs
  'gpt2':         { nLayer: 12, nHead: 12, nEmbd: 768,  blockSize: 1024 }, // 124M params
  'gpt2-medium':  { nLayer: 24, nHead: 16, nEmbd: 1024, blockSize: 1024 }, // 350M params
  'gpt2-large':   { nLayer: 36, nHead: 20, nEmbd: 1280, blockSize: 1024 }, // 774M params
  'gpt2-xl':      { nLayer: 48, nHead: 25, nEmbd: 1600, blockSize: 1024 }, // 1558M params
}
