import { ModelVariant } from '@gpt/model'

export type BackendId = 'cpu' | 'wasm' | 'webgl' | 'webgpu'

export type DatasetId = 'shakespeare' | 'recipes' | 'custom'

export type ModelWeightsIndex = {
  weights: {
    fileName: string
    fileSize: string
    modelVariant: ModelVariant
    datasetId: DatasetId
    testLoss: number
  }[]
}
