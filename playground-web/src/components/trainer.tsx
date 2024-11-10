import React from 'react'
import { Dataset, Model as ModelT, Trainer as ModelTrainer } from '@gpt/model'
import { Block } from 'baseui/block'
import { Skeleton } from 'baseui/skeleton'
import { Notification } from './shared/notification'
import { FadeIn } from './shared/fade'
import { FormControl } from 'baseui/form-control'
import { Input } from 'baseui/input'
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid'
import { Button, KIND } from 'baseui/button'
import { IoPlay } from 'react-icons/io5'
import { IoStop } from 'react-icons/io5'
import { ProgressBar, SIZE as PROGRESS_BAR_SIZE } from 'baseui/progress-bar'
import { LabelLarge, LabelSmall, LabelXSmall } from 'baseui/typography'
import { colors } from 'baseui/tokens'
import { Point, ResponsiveLine } from '@nivo/line'
import { Clock } from './shared/clock'
import { formatTime } from '../utils/string'
import { Card } from 'baseui/card'

type TrainerProps = {
  dataset: Dataset | undefined
  model: ModelT | undefined
}

type LossPoint = { step: number; loss: number }

const trainLossColor = colors.blue600
const testLossColor = colors.orange400
const trainDataSeriesId = 'Train Loss'
const testDataSeriesId = 'Test Loss'

export function Trainer(props: TrainerProps) {
  const { model, dataset } = props

  const [batchSize, setBatchSize] = React.useState<number>(8)
  const [maxEpochs, setMaxEpochs] = React.useState<number>(2000)
  const [learningRate, setLearningRate] = React.useState<string>('0.001')
  const [evalInterval, setEvalInterval] = React.useState<number>(200)
  const [evalIterations, setEvalIterations] = React.useState<number>(50)

  const [batchSizeErr, setBatchSizeErr] = React.useState<string>()
  const [maxEpochsErr, setMaxEpochsErr] = React.useState<string>()
  const [learningRateErr, setLearningRateErr] = React.useState<string>()
  const [evalIntervalErr, setEvalIntervalErr] = React.useState<string>()
  const [evalIterationsErr, setEvalIterationsErr] = React.useState<string>()

  const [isTraining, setIsTRaining] = React.useState<boolean>(false)
  const [isStopRequested, setIsStopRequested] = React.useState<boolean>(false)
  const isStopRequestedRef = React.useRef<boolean>(false)

  const [isLoading, setIsLoading] = React.useState<boolean>()
  const [errorMessage, setErrorMessage] = React.useState<string>()

  const [epoch, setEpoch] = React.useState<number>(0)

  const [testLosses, setTestLosses] = React.useState<LossPoint[]>([])
  const [trainLosses, setTrainLosses] = React.useState<LossPoint[]>([])
  const testLossesRef = React.useRef<LossPoint[]>([])
  const trainLossesRef = React.useRef<LossPoint[]>([])

  const [trainStartTime, setTrainStartTime] = React.useState<number>()
  const [trainStopTime, setTrainStopTime] = React.useState<number>()

  const formError =
    batchSizeErr ||
    maxEpochsErr ||
    learningRateErr ||
    evalIntervalErr ||
    evalIterationsErr

  const onStartTraining = () => {
    isStopRequestedRef.current = false
    setIsStopRequested(false)
    setIsTRaining(true)

    setEpoch(0)
    setTrainLosses([])
    setTestLosses([])
    testLossesRef.current = []
    trainLossesRef.current = []

    setTrainStartTime(performance.now())
    setTrainStopTime(undefined)

    // Let React apply the loading state before proceeding
    setTimeout(async () => {
      try {
        if (!dataset) {
          throw new Error('Cannot start training because dataset is empty')
        }
        if (!model) {
          throw new Error('Cannot start training because model is empty')
        }
        const learningRateNum = parseFloat(learningRate)
        const trainer = ModelTrainer({
          model,
          dataset,
          callbacks: {
            onEval: (params) => {
              setEpoch(params.step)
              const trainLossPoint: LossPoint = {
                step: params.step,
                loss: params.trainLoss || 0,
              }
              const testLossPoint: LossPoint = {
                step: params.step,
                loss: params.testLoss || 0,
              }
              trainLossesRef.current = [...trainLossesRef.current, trainLossPoint]
              testLossesRef.current = [...testLossesRef.current, testLossPoint]
              setTrainLosses([...trainLossesRef.current])
              setTestLosses([...testLossesRef.current])
            },
            isStopRequested: () => isStopRequestedRef.current,
          },
          params: {
            learningRate: learningRateNum,
            evalInterval,
            evalIterations,
            maxIters: maxEpochs,
            batchSize,
            blockSize: model.params.blockSize,
          },
        })
        await trainer.train()
      } catch (err) {
        setErrorMessage((err as Error).message)
      }
      setTrainStopTime(performance.now())
      setIsTRaining(false)
      isStopRequestedRef.current = false
      setIsStopRequested(false)
    }, 0)
  }

  const onStopTraining = () => {
    isStopRequestedRef.current = true
    setIsStopRequested(true)
    setIsTRaining(false)
  }

  const onFormValidate = () => {
    try {
      if (!batchSize) {
        throw new Error('Cannot be empty')
      }
      setBatchSizeErr(undefined)
    } catch (err) {
      setBatchSizeErr((err as Error).message)
    }

    try {
      if (!learningRate) {
        throw new Error('Cannot be empty')
      }
      try {
        const parsed = parseFloat(learningRate)
        if (`${parsed}` !== learningRate) {
          throw new Error('Must be a (float) number')
        }
        if (parsed <= 0) {
          throw new Error('Must be a positive number')
        }
      } catch (err) {
        throw new Error((err as Error).message)
      }
      setLearningRateErr(undefined)
    } catch (err) {
      setLearningRateErr((err as Error).message)
    }

    try {
      if (!maxEpochs) {
        throw new Error('Cannot be empty')
      }
      setMaxEpochsErr(undefined)
    } catch (err) {
      setMaxEpochsErr((err as Error).message)
    }

    try {
      if (!evalIterations) {
        throw new Error('Cannot be empty')
      }
      setEvalIterationsErr(undefined)
    } catch (err) {
      setEvalIterationsErr((err as Error).message)
    }

    try {
      if (!evalInterval) {
        throw new Error('Cannot be empty')
      }
      if (evalInterval > maxEpochs) {
        throw new Error('Cannot be greater than total epochs number')
      }
      setEvalIntervalErr(undefined)
    } catch (err) {
      setEvalIntervalErr((err as Error).message)
    }
  }

  const error = errorMessage && (
    <Notification kind="negative">{errorMessage}</Notification>
  )

  const loader = isLoading && (
    <FadeIn>
      <Block marginTop="scale300">
        <Skeleton rows={3} height="220px" width="100%" animation autoSizeRows />
      </Block>
    </FadeIn>
  )

  const isTrainingAllowed = !formError && !isTraining && !isStopRequested

  const isFormDisabled = isTraining || isStopRequested

  const trainingParams = (
    <FadeIn>
      <Block>
        <FlexGrid flexGridColumnCount={[1, 1, 3, 5]} flexGridColumnGap="scale600">
          <FlexGridItem>
            <FormControl
              label="Batch size"
              caption="How many independent sequences are processed in parallel"
              disabled={isFormDisabled}
              error={batchSizeErr}
            >
              <Input
                type="number"
                value={batchSize}
                onChange={(e) => setBatchSize(parseInt(e.target.value))}
                min={1}
                step={1}
              />
            </FormControl>
          </FlexGridItem>

          <FlexGridItem>
            <FormControl
              label="Epochs"
              caption="Max number of training iterations"
              disabled={isFormDisabled}
              error={maxEpochsErr}
            >
              <Input
                type="number"
                value={maxEpochs}
                onChange={(e) => setMaxEpochs(parseInt(e.target.value))}
                min={1}
                step={1}
              />
            </FormControl>
          </FlexGridItem>

          <FlexGridItem>
            <FormControl
              label="Learning rate"
              caption="Learning rate for Adam optimizer"
              disabled={isFormDisabled}
              error={learningRateErr}
            >
              <Input
                type="string"
                value={learningRate}
                onChange={(e) => setLearningRate(e.target.value)}
                min={0}
              />
            </FormControl>
          </FlexGridItem>

          <FlexGridItem>
            <FormControl
              label="Evaluation interval"
              caption="After how many epochs the model loss is to be evaluated"
              disabled={isFormDisabled}
              error={evalIntervalErr}
            >
              <Input
                type="number"
                value={evalInterval}
                onChange={(e) => setEvalInterval(parseInt(e.target.value))}
                min={1}
                step={1}
              />
            </FormControl>
          </FlexGridItem>

          <FlexGridItem>
            <FormControl
              label="Evaluation iterations"
              caption="How many test predictions to do during the evaluation"
              disabled={isFormDisabled}
              error={evalIterationsErr}
            >
              <Input
                type="number"
                value={evalIterations}
                onChange={(e) => setEvalIterations(parseInt(e.target.value))}
                min={1}
                step={1}
              />
            </FormControl>
          </FlexGridItem>
        </FlexGrid>

        <Notification kind="warning">
          The UI might not be responsive during the training! The training runs on the
          main thread to access the GPU, as Web Workers currently have limited GPU
          support.
        </Notification>

        <Block display="flex" justifyContent="center" marginTop="scale400">
          <Block display="flex" flexDirection="row" gridGap="scale300" flex={[1, 1, 0.5]}>
            <Button
              onClick={onStopTraining}
              kind={KIND.secondary}
              disabled={!isTraining || isStopRequested}
              isLoading={isStopRequested}
              startEnhancer={() => <IoStop />}
              overrides={{ Root: { style: { width: '100%' } } }}
            >
              Stop training
            </Button>
            <Button
              onClick={onStartTraining}
              disabled={!isTrainingAllowed}
              startEnhancer={() => <IoPlay />}
              isLoading={isTraining}
              overrides={{ Root: { style: { width: '100%' } } }}
            >
              Start training
            </Button>
          </Block>
        </Block>
      </Block>
    </FadeIn>
  )

  let trainTimeSoFar: number | undefined = undefined
  let trainTimeLeft: number | undefined = undefined
  if (trainStartTime && epoch > 0) {
    trainTimeSoFar = (trainStopTime || performance.now()) - trainStartTime
    const timePerEpoch = Math.ceil(trainTimeSoFar / epoch)
    const remainingEpochs = maxEpochs - epoch
    trainTimeLeft = remainingEpochs * timePerEpoch
  }

  const trainingProgress = (isTraining || epoch > 0) && (
    <FadeIn>
      <Block marginTop="scale800">
        <ProgressBar
          value={epoch}
          minValue={0}
          maxValue={maxEpochs}
          size={PROGRESS_BAR_SIZE.large}
          showLabel
          overrides={{ BarContainer: { style: { marginLeft: 0, marginRight: 0 } } }}
          getProgressLabel={(value) => (
            <Block display="flex" alignItems="center" justifyContent="center">
              <Block marginRight="5px">
                <LabelSmall>Epoch: </LabelSmall>
              </Block>
              <Block>
                <LabelSmall $style={{ lineHeight: '18px' }}>{value}</LabelSmall>
              </Block>
              <Block marginLeft="5px">
                <LabelSmall $style={{ color: 'grey' }}>/&nbsp;{maxEpochs}</LabelSmall>
              </Block>
              <Block marginLeft="20px">
                <Clock timeMs={trainTimeSoFar} animated={isTraining} />
              </Block>
              {trainTimeLeft !== undefined && isTraining && epoch > 1 && (
                <FadeIn>
                  <Block marginLeft="5px">
                    <div style={{ color: 'grey' }}>
                      /~{formatTime(trainTimeLeft)} left
                    </div>
                  </Block>
                </FadeIn>
              )}
            </Block>
          )}
        />

        <Block marginTop="scale800">
          <Card>
            <Block
              display="flex"
              flexDirection="row"
              justifyContent={['space-between', 'space-between', 'flex-start']}
            >
              <Block width={['auto', 'auto', '150px']}>
                <FormControl label="Train Loss:">
                  <LabelLarge $style={{ fontSize: '30px', color: trainLossColor }}>
                    {trainLosses.length
                      ? trainLosses[trainLosses.length - 1].loss
                      : 'N/A'}
                  </LabelLarge>
                </FormControl>
              </Block>
              <Block>
                <FormControl label="Test Loss:">
                  <LabelLarge $style={{ fontSize: '30px', color: testLossColor }}>
                    {testLosses.length ? testLosses[testLosses.length - 1].loss : 'N/A'}
                  </LabelLarge>
                </FormControl>
              </Block>
            </Block>

            <Block height="350px" overflow="visible">
              <ResponsiveLine
                data={[
                  {
                    id: testDataSeriesId,
                    color: testLossColor,
                    data: testLosses.map(({ step, loss }) => ({ x: step, y: loss })),
                  },
                  {
                    id: trainDataSeriesId,
                    color: trainLossColor,
                    data: trainLosses.map(({ step, loss }) => ({ x: step, y: loss })),
                  },
                ]}
                margin={{ top: 35, right: 15, bottom: 45, left: 45 }}
                xScale={{ type: 'point' }}
                yScale={{ type: 'linear', min: 'auto' }}
                colors={{ datum: 'color' }}
                yFormat=" >-.4f"
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Epoch',
                  legendOffset: 36,
                  legendPosition: 'middle',
                  truncateTickAt: 0,
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Loss',
                  legendOffset: -40,
                  legendPosition: 'middle',
                  truncateTickAt: 0,
                  tickValues:
                    testLosses.length === 1
                      ? [
                          Math.min(testLosses[0].loss, trainLosses[0].loss),
                          Math.max(testLosses[0].loss, trainLosses[0].loss),
                        ]
                      : undefined,
                }}
                pointSize={4}
                pointColor={{ theme: 'background' }}
                pointBorderWidth={3}
                pointBorderColor={{ from: 'serieColor' }}
                pointLabel="data.yFormatted"
                tooltip={CustomTooltip}
                pointLabelYOffset={-12}
                enableTouchCrosshair={true}
                useMesh={true}
                legends={[
                  {
                    anchor: 'top',
                    direction: 'row',
                    justify: false,
                    translateX: 5,
                    translateY: -35,
                    itemsSpacing: 0,
                    itemDirection: 'left-to-right',
                    itemWidth: 100,
                    itemHeight: 20,
                    itemOpacity: 1,
                    symbolSize: 12,
                    symbolShape: 'circle',
                  },
                ]}
              />
            </Block>
          </Card>
        </Block>
      </Block>
    </FadeIn>
  )

  React.useEffect(() => {
    onFormValidate()
  }, [batchSize, maxEpochs, learningRate, evalInterval, evalIterations])

  return (
    <Block>
      {loader}
      {trainingParams}
      {error}
      {trainingProgress}
    </Block>
  )
}

const CustomTooltip = ({ point }: { point: Point }) => (
  <Block
    backgroundColor="white"
    padding="scale200"
    $style={{ borderRadius: '3px', border: '1px solid #ccc' }}
  >
    <LabelXSmall
      $style={{
        color: point.serieId === testDataSeriesId ? testLossColor : trainLossColor,
      }}
    >
      {point.data.y as number}
    </LabelXSmall>
  </Block>
)
