import React from 'react'
import * as tf from '@tensorflow/tfjs'
import { Block } from 'baseui/block'
import { BackendId } from '../types/playground'
import { Dataset, Model } from '@gpt/model'
import { Button } from 'baseui/button'
import { Textarea, SIZE } from 'baseui/textarea'
import { FormControl } from 'baseui/form-control'

type DebuggerProps = {
  model: Model | undefined
  dataset: Dataset | undefined
  backend: BackendId | undefined
}

export function Debugger(props: DebuggerProps) {
  const { backend, model, dataset } = props

  const [memory, setMemory] = React.useState<unknown>()

  const onMemoryInfo = () => {
    setMemory(tf.memory())
  }

  const onModelDispose = () => {
    model?.dispose?.()
    onMemoryInfo()
  }

  const onDatasetDispose = () => {
    dataset?.dispose?.()
    onMemoryInfo()
  }

  React.useEffect(() => {
    if (!backend) return
    onMemoryInfo()
  }, [backend, model, dataset])

  return (
    <Block display="flex" flexDirection={['column', 'column', 'row']} gridGap="scale600">
      <Block display="flex" flexDirection="column" gridGap="scale600" flex="1">
        <Block display="flex">
          <Button
            onClick={onModelDispose}
            overrides={{ Root: { style: { width: '100%' } } }}
          >
            Dispose Model
          </Button>
        </Block>

        <Block display="flex">
          <Button
            onClick={onDatasetDispose}
            overrides={{ Root: { style: { width: '100%' } } }}
          >
            Dispose Dataset
          </Button>
        </Block>

        <Block display="flex" flexDirection="column">
          <Button
            onClick={onMemoryInfo}
            overrides={{ Root: { style: { width: '100%' } } }}
          >
            Update Memory Info
          </Button>
        </Block>
      </Block>

      <Block display="flex" flexDirection="column" flex="1">
        <FormControl>
          <Textarea
            size={SIZE.compact}
            value={memory ? JSON.stringify(memory, null, 2) : undefined}
            readOnly
            rows={8}
          />
        </FormControl>
      </Block>
    </Block>
  )
}
