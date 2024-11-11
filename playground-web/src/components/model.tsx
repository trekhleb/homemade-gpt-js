import React from 'react'
import { Block } from 'baseui/block'
import { CONFIG, GPT, Model as ModelT, ModelVariant } from '@gpt/model'
import { Skeleton } from 'baseui/skeleton'
import { BackendId } from '../types/playground'
import { Notification } from './shared/notification'
import { SegmentedControl, Segment } from 'baseui/segmented-control'
import { FadeIn } from './shared/fade'
import { Count } from './shared/count'
import { FormControl } from 'baseui/form-control'
import { Slider, SliderOverrides } from 'baseui/slider'
import { FileUploader } from 'baseui/file-uploader'
import { Button, SIZE, KIND } from 'baseui/button'
import { RiDownloadLine } from 'react-icons/ri'
import { useSnackbar } from 'baseui/snackbar'
import { FaCheck } from 'react-icons/fa'
import { Card } from 'baseui/card'

type ModelProps = {
  model: ModelT | undefined
  backend: BackendId | undefined
  vocabSize: number | undefined
  onChange?: (model: ModelT, modelVariant: ModelVariant) => Promise<void>
  onDownloadModelWeights?: () => void
}

export function Model(props: ModelProps) {
  const {
    onChange = () => {},
    model,
    backend,
    vocabSize,
    onDownloadModelWeights = () => {},
  } = props

  const { enqueue } = useSnackbar()

  const [modelVariant, setModelVariant] = React.useState<ModelVariant>('gpt-pico')
  const [errorMessage, setErrorMessage] = React.useState<string>()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [paramsCount, setParamsCount] = React.useState<number>()

  const [nLayer, setNLayer] = React.useState<number>(CONFIG[modelVariant].nLayer)
  const [nHead, setNHead] = React.useState<number>(CONFIG[modelVariant].nHead)
  const [nEmbd, setNEmbd] = React.useState<number>(CONFIG[modelVariant].nEmbd)
  const [blockSize, setBlockSize] = React.useState<number>(CONFIG[modelVariant].blockSize)

  const onModelInit = async () => {
    onModelChange(modelVariant)
  }

  const onModelChange = async (nextModelVariant: ModelVariant) => {
    setIsLoading(true)
    setErrorMessage(undefined)

    // Let React apply the loading state before proceeding
    setTimeout(async () => {
      try {
        if (!vocabSize) {
          throw new Error('Vocabulary size is undefined')
        }

        const nextModelConfig = CONFIG[nextModelVariant]
        const nextModel = GPT({
          ...nextModelConfig,
          vocabSize,
        })
        nextModel.build() // Initialize weights
        const { params } = nextModel.summary()

        await onChange(nextModel, nextModelVariant)

        setModelVariant(nextModelVariant)
        setNLayer(nextModelConfig.nLayer)
        setNHead(nextModelConfig.nHead)
        setNEmbd(nextModelConfig.nEmbd)
        setBlockSize(nextModelConfig.blockSize)
        setParamsCount(params)
      } catch (err) {
        setErrorMessage((err as Error).message)
      }
      setIsLoading(false)
    }, 0)
  }

  const onUploadModelWeights = (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return
    const file = acceptedFiles[0]
    const reader = new FileReader()
    reader.onload = (event) => {
      setErrorMessage(undefined)
      try {
        const weights = JSON.parse(event.target?.result as string)
        model?.setWeights?.(weights)
        enqueue({
          message: 'Model weights have been applied',
          startEnhancer: ({ size }) => <FaCheck size={size} />,
        })
      } catch (err) {
        setErrorMessage('Error parsing JSON: ' + (err as Error).message)
      }
    }
    reader.onerror = (err) => {
      setErrorMessage('Error reading file: ' + err)
    }
    reader.readAsText(file)
  }

  const error = errorMessage && (
    <Notification kind="negative">{errorMessage}</Notification>
  )

  const loader = isLoading && (
    <Block marginTop="scale300">
      <Block marginBottom="scale200" color="grey" $style={{ fontSize: '12px' }}>
        Initializing the GPT model (this may block the UI)...
      </Block>
      <Skeleton rows={4} height="424px" width="100%" animation autoSizeRows />
    </Block>
  )

  const segments = (
    <Block paddingBottom="scale600">
      <FadeIn>
        <SegmentedControl
          activeKey={modelVariant}
          disabled={isLoading}
          onChange={({ activeKey }) => {
            onModelChange(activeKey as ModelVariant)
          }}
        >
          {(Object.keys(MODELS) as ModelVariant[]).map((modelVariant) => {
            return (
              <Segment
                key={modelVariant}
                label={MODELS[modelVariant]!.label}
                description={MODELS[modelVariant]!.description}
              />
            )
          })}
        </SegmentedControl>
      </FadeIn>
    </Block>
  )

  const totalParams =
    !isLoading && paramsCount !== undefined ? (
      <FadeIn>
        <Block>
          <Count
            count={paramsCount}
            label="transformer params in total"
            description="excluding LLM Head layer"
          />
        </Block>
      </FadeIn>
    ) : null

  const readOnlyParams =
    !isLoading && modelVariant && model ? (
      <FadeIn>
        <Block>
          <FormControl label="Layers">
            <Slider
              value={[nLayer]}
              min={1}
              max={12}
              step={1}
              persistentThumb
              marks
              overrides={sliderOverrides}
            />
          </FormControl>

          <FormControl label="Attention Heads">
            <Slider
              value={[nHead]}
              min={1}
              max={12}
              step={1}
              persistentThumb
              marks
              overrides={sliderOverrides}
            />
          </FormControl>

          <FormControl label="Embedding Size">
            <Slider
              value={[nEmbd]}
              min={1}
              max={768}
              step={16}
              persistentThumb
              marks
              overrides={sliderOverrides}
            />
          </FormControl>

          <FormControl label="Context Window Size">
            <Slider
              value={[blockSize]}
              min={1}
              max={1024}
              step={16}
              persistentThumb
              marks
              overrides={sliderOverrides}
            />
          </FormControl>
        </Block>
      </FadeIn>
    ) : null

  const weightsUploader =
    !isLoading && modelVariant && model ? (
      <Card>
        <Block marginBottom="scale800">
          <FormControl
            label="Download (pre-trained) model weights"
            caption={() => (
              <>
                Export the <b>{modelVariant.replace('gpt', 'GPT')}</b> model weights to a
                JSON file to apply them later
              </>
            )}
          >
            <Button
              onClick={onDownloadModelWeights}
              size={SIZE.compact}
              kind={KIND.secondary}
              startEnhancer={() => <RiDownloadLine />}
              overrides={{ Root: { style: { width: '100%' } } }}
            >
              Download model weights
            </Button>
          </FormControl>
        </Block>

        <Block>
          <FormControl
            label="Upload (pre-trained) model weights"
            caption={() => (
              <>
                If you pre-trained <b>{modelVariant.replace('gpt', 'GPT')}</b> model
                before and saved the weights, you may apply them here and continue
                training
              </>
            )}
          >
            <FileUploader
              accept="application/json"
              multiple={false}
              onDrop={onUploadModelWeights}
            />
          </FormControl>
        </Block>
      </Card>
    ) : null

  React.useEffect(() => {
    if (!backend || !vocabSize) return
    if (model === undefined) {
      onModelInit()
    }
  }, [model, backend, vocabSize])

  return (
    <Block>
      {segments}
      {loader}
      {totalParams}

      <Block
        display="flex"
        marginTop="scale800"
        flexDirection={['column', 'column', 'row']}
        gridGap={['0px', '0px', 'scale600']}
      >
        <Block flex={2}>{readOnlyParams}</Block>
        <Block flex={1}>{weightsUploader}</Block>
      </Block>

      {error}
    </Block>
  )
}

const MODELS: Partial<
  Record<ModelVariant, { label: string; description?: React.ReactNode }>
> = {
  'gpt-pico': {
    label: 'Pico',
  },
  'gpt-nano': {
    label: 'Nano',
  },
  'gpt-micro': {
    label: 'Micro',
  },
  'gpt-mini': {
    label: 'Mini',
  },
  gpt2: {
    label: 'GPT-2',
  },
}

const sliderOverrides: SliderOverrides = {
  ThumbValue: () => null,
  InnerThumb: ({ $value, $thumbIndex }) => <>{$value[$thumbIndex]}</>,
  Thumb: {
    style: () => ({
      color: 'white',
      fontWeight: 600,
      height: '32px',
      width: '32px',
      borderRadius: '50%',
    }),
  },
}
