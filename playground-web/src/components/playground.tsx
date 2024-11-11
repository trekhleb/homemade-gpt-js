import React from 'react'
import { Dataset as DatasetT, Model as ModelT, ModelVariant } from '@gpt/model'
import { Backend } from './backend'
import { BackendId, DatasetId } from '../types/playground'
import { Step } from './shared/step'
import { Dataset } from './dataset'
import { Model } from './model'
import { Banner } from './shared/banner'
import { Footer } from './shared/footer'
import { Trainer } from './trainer'
import { WINDOW_PADDING_HORIZONTAL } from '../config/theme'
import { Block } from 'baseui/block'
import { Generator } from './generator'
import { Debugger } from './debugger'
import { saveAsFile } from '../utils/file'

export function Playground() {
  const [backend, setBackend] = React.useState<BackendId>()

  const [dataset, setDataset] = React.useState<DatasetT>()
  const [datasetId, setDatasetId] = React.useState<DatasetId>()

  const [model, setModel] = React.useState<ModelT>()
  const [modelVariant, setModelVariant] = React.useState<ModelVariant>()

  const onBackendChange = async (backend: BackendId) => {
    model?.dispose?.()
    setModel(undefined)

    dataset?.dispose?.()
    setDataset(undefined)

    setBackend(backend)
  }

  const onDatasetChange = async (nextDataset: DatasetT, nextDatasetId: DatasetId) => {
    model?.dispose?.()
    setModel(undefined)

    dataset?.dispose?.()
    setDataset(nextDataset)
    setDatasetId(nextDatasetId)
  }

  const onModelChange = async (nextModel: ModelT, nextModelVariant: ModelVariant) => {
    model?.dispose?.()
    setModel(nextModel)
    setModelVariant(nextModelVariant)
  }

  const onDownloadModelWeights = async () => {
    const weights = await model?.getWeights?.()
    if (weights && modelVariant) {
      const fileName = modelVariant + '--' + datasetId
      saveAsFile(weights, fileName)
    }
  }

  return (
    <>
      <Block
        paddingLeft={WINDOW_PADDING_HORIZONTAL}
        paddingRight={WINDOW_PADDING_HORIZONTAL}
      >
        <Banner />

        <Step title="1. TensorFlow Backend">
          <Backend backend={backend} onChange={onBackendChange} />
        </Step>

        <Step title="2. Dataset">
          <Dataset dataset={dataset} onChange={onDatasetChange} backend={backend} />
        </Step>

        <Step title="3. GPT Model Size">
          <Model
            model={model}
            backend={backend}
            vocabSize={dataset?.vocabSize}
            onChange={onModelChange}
            onDownloadModelWeights={onDownloadModelWeights}
          />
        </Step>

        <Step title="4. Model Training">
          <Trainer model={model} dataset={dataset} />
        </Step>

        <Step title="5. Generation (Prediction)">
          <Generator model={model} dataset={dataset} />
        </Step>

        <Step title="Debug" accordion closed>
          <Debugger model={model} dataset={dataset} backend={backend} />
        </Step>
      </Block>

      <Footer />
    </>
  )
}
