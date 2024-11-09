import React from 'react'
import { Dataset as DatasetT, Model as ModelT } from '@gpt/model'
import { Backend } from './backend'
import { BackendId } from '../types/playground'
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

export function Playground() {
  const [backend, setBackend] = React.useState<BackendId>()
  const [dataset, setDataset] = React.useState<DatasetT>()
  const [model, setModel] = React.useState<ModelT>()

  const onBackendChange = async (backend: BackendId) => {
    model?.dispose?.()
    setModel(undefined)

    dataset?.dispose?.()
    setDataset(undefined)

    setBackend(backend)
  }

  const onDatasetChange = async (nextDataset: DatasetT) => {
    model?.dispose?.()
    setModel(undefined)

    dataset?.dispose?.()
    setDataset(nextDataset)
  }

  const onModelChange = async (nextModel: ModelT) => {
    model?.dispose?.()
    setModel(nextModel)
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
