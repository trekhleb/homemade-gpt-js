import React from 'react'
import * as tf from '@tensorflow/tfjs'
import { Dataset, Model as ModelT } from '@gpt/model'
import { Block } from 'baseui/block'
import { FadeIn } from './shared/fade'
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid'
import { FormControl } from 'baseui/form-control'
import { Checkbox, LABEL_PLACEMENT } from 'baseui/checkbox'
import { Input } from 'baseui/input'
import { Button } from 'baseui/button'
import { ImLoop } from 'react-icons/im'
import { Textarea, SIZE } from 'baseui/textarea'
import { formatTime, msToS } from '../utils/string'

type GeneratorProps = {
  dataset: Dataset | undefined
  model: ModelT | undefined
}

export function Generator(props: GeneratorProps) {
  const { model, dataset } = props

  const [isGenerating, setIsGeneration] = React.useState<boolean>(false)

  const [maxNewTokens, setMaxNewTokens] = React.useState<number>(500)
  const [temperature, setTemperature] = React.useState<number>(1)
  const [doSample, setDoSample] = React.useState<boolean>(true)
  const [topK, setTopK] = React.useState<number>()

  const [maxNewTokensErr, setMaxNewTokensErr] = React.useState<string>()
  const [temperatureErr, setTemperatureErr] = React.useState<string>()
  const [doSampleErr, setDoSampleErr] = React.useState<string>()
  const [topKErr, setTopKErr] = React.useState<string>()

  const [generateStartTime, setGenerateStartTime] = React.useState<number>()
  const [generateStopTime, setGenerateStopTime] = React.useState<number>()

  const [generatedText, setGeneratedText] = React.useState<string>('')
  const generatedTextRef = React.useRef<string>('')

  const formError = maxNewTokensErr || temperatureErr || doSampleErr || topKErr

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

  const generationTime =
    generateStopTime && generateStartTime
      ? msToS(generateStopTime - generateStartTime, 2)
      : undefined

  const isFormDisabled = isGenerating
  const isGenerationAllowed = !isGenerating && !formError && model && dataset

  const generatedTextForm = (
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

  return <>{form}</>
}
