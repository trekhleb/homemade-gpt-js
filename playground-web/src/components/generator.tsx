import React from 'react'
import * as tf from '@tensorflow/tfjs'
import { Dataset, Model as ModelT, ModelVariant } from '@gpt/model'
import { Block } from 'baseui/block'
import { FadeIn } from './shared/fade'
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid'
import { FormControl } from 'baseui/form-control'
import { Checkbox, LABEL_PLACEMENT } from 'baseui/checkbox'
import { Input } from 'baseui/input'
import { Button, KIND, SIZE as BUTTON_SIZE } from 'baseui/button'
import { ImLoop } from 'react-icons/im'
import { Textarea, SIZE } from 'baseui/textarea'
import { msToS } from '../utils/string'
import { Card } from 'baseui/card'
import { Accordion, Panel } from 'baseui/accordion'
import { DatasetId, ModelWeightsIndex } from '../types/playground'
import { MODEL_WEIGHTS_BASE_URL } from '../config/links'
import { Notification } from './shared/notification'
import { useSnackbar } from 'baseui/snackbar'
import { FaCheck } from 'react-icons/fa'

type GeneratorProps = {
  dataset: Dataset | undefined
  model: ModelT | undefined
  modelVariant: ModelVariant | undefined
  datasetId: DatasetId | undefined
}

export function Generator(props: GeneratorProps) {
  const { model, modelVariant, dataset, datasetId } = props

  const { enqueue } = useSnackbar()

  const [isGenerating, setIsGeneration] = React.useState<boolean>(false)
  const [isLoadingWeights, setIsLoadingWeights] = React.useState<boolean>(false)

  const [maxNewTokens, setMaxNewTokens] = React.useState<number>(500)
  const [temperature, setTemperature] = React.useState<number>(1)
  const [doSample, setDoSample] = React.useState<boolean>(true)
  const [errorMessage, setErrorMessage] = React.useState<string>()

  const [topK, setTopK] = React.useState<number>()

  const [maxNewTokensErr, setMaxNewTokensErr] = React.useState<string>()
  const [temperatureErr, setTemperatureErr] = React.useState<string>()
  const [doSampleErr, setDoSampleErr] = React.useState<string>()
  const [topKErr, setTopKErr] = React.useState<string>()

  const [generateStartTime, setGenerateStartTime] = React.useState<number>()
  const [generateStopTime, setGenerateStopTime] = React.useState<number>()

  const [generatedText, setGeneratedText] = React.useState<string>('')
  const generatedTextRef = React.useRef<string>('')

  const [pretrainedWeightsIndex, setPretrainedWeightsIndex] =
    React.useState<ModelWeightsIndex>()

  const formError = maxNewTokensErr || temperatureErr || doSampleErr || topKErr

  const loadPretrainedWeightsIndex = async () => {
    try {
      const response = await fetch(`${MODEL_WEIGHTS_BASE_URL}/weights.json`)
      if (!response.ok) throw new Error(`Error: ${response.statusText}`)
      const weightsIndex = await response.json()
      setPretrainedWeightsIndex(weightsIndex as ModelWeightsIndex)
    } catch (error) {
      setErrorMessage(
        `Cannot load pre-trained model weights index: ${(error as Error).message}`,
      )
    }
  }

  const onLoadPretrainedWeights = async (weightsFilePath: string) => {
    setIsLoadingWeights(true)
    setTimeout(async () => {
      try {
        const response = await fetch(`${MODEL_WEIGHTS_BASE_URL}${weightsFilePath}`)
        if (!response.ok) throw new Error(`Error: ${response.statusText}`)
        const weights = await response.json()
        if (!weights) throw new Error(`Empty weights`)
        if (model && model.setWeights) {
          model.setWeights(weights)
        }
        enqueue({
          message: 'Model weights have been applied. You may try to generate the text.',
          startEnhancer: ({ size }) => <FaCheck size={size} />,
        })
      } catch (err) {
        setErrorMessage((err as Error).message)
      }
      setIsLoadingWeights(false)
    }, 0)
  }

  const onStartGeneration = () => {
    setGeneratedText('')
    generatedTextRef.current = ''
    setIsGeneration(true)
    setGenerateStartTime(performance.now())
    setGenerateStopTime(undefined)

    // Let React apply the loading state before proceeding
    setTimeout(async () => {
      if (model && dataset) {
        const generated = await model.generate(
          {
            idx: tf.ones([1, 1], 'int32'),
            maxNewTokens,
            temperature,
            doSample,
            topK,
          },
          async (nextToken) => {
            const nextChar = dataset.decode([nextToken])[0]
            generatedTextRef.current += nextChar
            setGeneratedText(generatedTextRef.current)
          },
        )
        generated.dispose()
      }
      setIsGeneration(false)
      setGenerateStopTime(performance.now())
    }, 0)
  }

  const onFormValidate = () => {
    try {
      if (!maxNewTokens) {
        throw new Error('Cannot be empty')
      }
      setMaxNewTokensErr(undefined)
    } catch (err) {
      setMaxNewTokensErr((err as Error).message)
    }

    try {
      if (!temperature) {
        throw new Error('Cannot be empty')
      }
      setTemperatureErr(undefined)
    } catch (err) {
      setTemperatureErr((err as Error).message)
    }

    try {
      if (topK) {
        if (topK <= 0) {
          throw new Error('IT should be a positive integer')
        }
      }
      setTopKErr(undefined)
    } catch (err) {
      setTopKErr((err as Error).message)
    }
  }

  const error = errorMessage && (
    <Notification kind="negative">{errorMessage}</Notification>
  )

  const generationTime =
    generateStopTime && generateStartTime
      ? msToS(generateStopTime - generateStartTime, 2)
      : undefined

  const isFormDisabled = isGenerating
  const isGenerationAllowed = !isGenerating && !formError && model && dataset

  const generatedTextForm = (generatedText || isGenerating) && (
    <FadeIn>
      <Block marginTop="scale800">
        <FormControl
          label="Generated text"
          caption={generationTime ? `Generated in: ${generationTime}` : undefined}
        >
          <Textarea size={SIZE.compact} value={generatedText} rows={10} readOnly />
        </FormControl>
      </Block>
    </FadeIn>
  )

  const preTrainedWeightsList = findWeightsForCurrentModelDataset(
    pretrainedWeightsIndex,
    modelVariant,
    datasetId,
  )

  const preTrainedWeights =
    pretrainedWeightsIndex && preTrainedWeightsList?.length ? (
      <FadeIn>
        <Block marginBottom="scale600">
          <Card>
            <Accordion
              accordion
              overrides={{
                Header: {
                  style: {
                    margin: 0,
                    padding: 0,
                    lineHeight: '28px',
                  },
                },
                Content: {
                  style: {
                    margin: 0,
                    paddingTop: '16px',
                    paddingRight: 0,
                    paddingLeft: 0,
                    paddingBottom: 0,
                    borderBottomWidth: 0,
                  },
                },
                PanelContainer: { style: { borderBottomWidth: 0 } },
              }}
            >
              <Panel title="Apply pre-trained model weights">
                <Notification kind="info" style={{ marginTop: 0, marginBottom: '12px' }}>
                  You may skip the training step and load the pre-trained model weights to
                  do the text generation. This will override your current model weights.
                </Notification>

                <Block
                  display="flex"
                  flexDirection={['column', 'column', 'row']}
                  gridGap="scale400"
                >
                  {preTrainedWeightsList.map((weights, index) => (
                    <Button
                      key={index}
                      kind={KIND.secondary}
                      size={BUTTON_SIZE.compact}
                      disabled={isLoadingWeights}
                      isLoading={isLoadingWeights}
                      onClick={() => onLoadPretrainedWeights(weights.fileName)}
                    >
                      Load weights ({weights.fileSize}, loss: {weights.testLoss})
                    </Button>
                  ))}
                </Block>
              </Panel>
            </Accordion>
          </Card>
        </Block>
      </FadeIn>
    ) : null

  const form = (
    <FadeIn>
      <Block>
        <Block>
          <FlexGrid flexGridColumnCount={[1, 1, 4, 4]} flexGridColumnGap="scale600">
            <FlexGridItem>
              <FormControl
                label="Sequence length"
                caption="Determines how long the generated sequence should be."
                disabled={isFormDisabled}
                error={maxNewTokensErr}
              >
                <Input
                  type="number"
                  value={maxNewTokens}
                  onChange={(e) => setMaxNewTokens(parseInt(e.target.value))}
                  min={1}
                  step={1}
                />
              </FormControl>
            </FlexGridItem>

            <FlexGridItem>
              <FormControl
                label="Temperature"
                caption="The degree of randomness in token selection. Higher temperatures can lead to more creative or sometimes hallucinated results."
                disabled={isFormDisabled}
                error={temperatureErr}
              >
                <Input
                  type="number"
                  value={temperature}
                  onChange={(e) => setTemperature(parseInt(e.target.value))}
                  min={1}
                  step={1}
                />
              </FormControl>
            </FlexGridItem>

            <FlexGridItem>
              <FormControl
                label="Top K"
                caption="From how many of the most probable tokens can the next token be chosen during sampling"
                disabled={isFormDisabled}
                error={topKErr}
              >
                <Input
                  type="number"
                  value={topK}
                  onChange={(e) => setTopK(parseInt(e.target.value))}
                  min={1}
                  step={1}
                />
              </FormControl>
            </FlexGridItem>

            <FlexGridItem>
              <FormControl
                label="Sampling"
                caption="Controls the trade-off between creativity (when random sampling is enabled) and predictability (when choosing the most probable token) in text generation."
                disabled={isFormDisabled}
                error={doSampleErr}
              >
                <Checkbox
                  checked={doSample}
                  onChange={(e) => setDoSample(e.target.checked)}
                  labelPlacement={LABEL_PLACEMENT.right}
                >
                  Random sampling
                </Checkbox>
              </FormControl>
            </FlexGridItem>
          </FlexGrid>
        </Block>

        <Block display="flex" justifyContent="center" marginTop="scale400">
          <Block flex={[1, 1, 0.5]}>
            <Button
              onClick={onStartGeneration}
              disabled={!isGenerationAllowed}
              startEnhancer={() => <ImLoop />}
              isLoading={isGenerating}
              overrides={{ Root: { style: { width: '100%' } } }}
            >
              Generate Text
            </Button>
          </Block>
        </Block>

        {generatedTextForm}
      </Block>
    </FadeIn>
  )

  React.useEffect(() => {
    onFormValidate()
  }, [maxNewTokens, temperature, doSample, topK])

  React.useEffect(() => {
    loadPretrainedWeightsIndex()
  }, [])

  return (
    <>
      {preTrainedWeights}
      {error}
      {form}
    </>
  )
}

function findWeightsForCurrentModelDataset(
  weightsIndex?: ModelWeightsIndex,
  modelVariant?: ModelVariant,
  datasetId?: DatasetId,
): ModelWeightsIndex['weights'] {
  if (!weightsIndex || !weightsIndex.weights || !modelVariant || !datasetId) {
    return []
  }
  return weightsIndex.weights
    .filter((w) => w.datasetId === datasetId && w.modelVariant === modelVariant)
    .sort((w1, w2) => w1.testLoss - w2.testLoss)
}
