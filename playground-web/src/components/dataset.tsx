import React from 'react'
import { Dataset as DatasetT, CharDataset } from '@gpt/model'
import { Block } from 'baseui/block'
import { SegmentedControl, Segment } from 'baseui/segmented-control'
import { BackendId } from '../types/playground'
import { FaFeatherAlt } from 'react-icons/fa'
import { SIZE } from 'baseui/input'
import { StyledLink } from 'baseui/link'
import { MdFastfood } from 'react-icons/md'
import { Textarea } from 'baseui/textarea'
import { FormControl } from 'baseui/form-control'
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid'
import { Skeleton } from 'baseui/skeleton'
import { BASE_PATH, RECIPE_BOX_DATASET_URL } from '../config/links'
import { Notification } from './shared/notification'
import { FadeIn } from './shared/fade'
import { FaTools } from 'react-icons/fa'
import { Count } from './shared/count'

const inputSize = SIZE.mini

type DatasetId = 'shakespeare' | 'recipes' | 'custom'

type StepProps = {
  dataset: DatasetT | undefined
  backend: BackendId | undefined
  onChange?: (dataset: DatasetT) => Promise<void>
}

export function Dataset(props: StepProps) {
  const { onChange = () => {}, dataset, backend } = props

  const [datasetId, setDatasetId] = React.useState<DatasetId>('shakespeare')
  const [isLoading, setIsLoading] = React.useState<boolean>()
  const [errorMessage, setErrorMessage] = React.useState<string>()

  const [customDatasetText, setCustomDatasetText] = React.useState<string>()

  const onDatasetInit = async () => {
    onDatasetChange(datasetId)
  }

  const onDatasetChange = async (nextDatasetId: DatasetId) => {
    setIsLoading(true)
    setErrorMessage(undefined)
    try {
      if (nextDatasetId === 'custom') {
        const nextDataset = await CharDataset({ textSource: customDatasetText || '' })
        await onChange(nextDataset)
      } else {
        let textSourceURL: string | undefined = undefined
        if (nextDatasetId === 'shakespeare') {
          textSourceURL = `${BASE_PATH}/dataset-tinyshakespeare.txt`
        } else if (nextDatasetId === 'recipes') {
          textSourceURL = `${BASE_PATH}/dataset-recipes.txt`
        }
        if (textSourceURL) {
          const nextDataset = await CharDataset({ textSourceURL })
          await onChange(nextDataset)
        }
      }
      setDatasetId(nextDatasetId)
    } catch (err) {
      setErrorMessage((err as Error).message)
    }
    setIsLoading(false)
  }

  React.useEffect(() => {
    if (!backend) return
    if (dataset === undefined) {
      onDatasetInit()
    }
  }, [backend, dataset])

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

  const segments = (
    <Block paddingBottom="scale400">
      <FadeIn>
        <SegmentedControl
          activeKey={datasetId}
          disabled={isLoading}
          onChange={({ activeKey }) => {
            onDatasetChange(activeKey as DatasetId)
          }}
        >
          <Segment
            key="shakespeare"
            label="Shakespeare"
            artwork={() => <FaFeatherAlt />}
          />
          <Segment key="recipes" label="Recipes" artwork={() => <MdFastfood />} />
          <Segment key="custom" label="Custom" artwork={() => <FaTools />} />
        </SegmentedControl>
      </FadeIn>
    </Block>
  )

  const standardSummary = !isLoading &&
    ['shakespeare', 'recipes'].includes(datasetId) && (
      <FadeIn>
        <FlexGrid flexGridColumnCount={[1, 1, 2]} flexGridColumnGap="scale600">
          <FlexGridItem>
            <FormControl
              label="Dataset preview"
              caption={() => (
                <>
                  {datasetId === 'shakespeare' && (
                    <>
                      Full text:{' '}
                      <StyledLink href={dataset?.textSourceURL}>
                        Tiny Shakespeare
                      </StyledLink>
                    </>
                  )}
                  {datasetId === 'recipes' && (
                    <>
                      Source:{' '}
                      <StyledLink href={RECIPE_BOX_DATASET_URL}>Recipe box</StyledLink>
                    </>
                  )}
                </>
              )}
              disabled={!dataset?.text}
            >
              <Textarea
                value={dataset?.text?.substring(0, 10_000) + '...'}
                rows={7}
                size={inputSize}
                readOnly
              />
            </FormControl>
          </FlexGridItem>

          <FlexGridItem>
            <Block display="flex" flexDirection="row" gridGap="scale600">
              <Block flex="1">
                <FormControl label="Dataset size">
                  <Count
                    count={dataset?.dataSize}
                    label="characters in total"
                    hierarchy="secondary"
                  />
                </FormControl>
              </Block>

              <Block flex="1">
                <FormControl label="Vocabulary size">
                  <Count
                    count={dataset?.vocabSize}
                    label="unique characters"
                    hierarchy="secondary"
                  />
                </FormControl>
              </Block>
            </Block>

            <FormControl
              label="Vocabulary"
              caption="Unique characters (including line breaks and spaces)"
              disabled={!dataset?.vocabulary}
            >
              <Textarea
                value={dataset?.vocabulary?.join('')}
                rows={3}
                size={inputSize}
                readOnly
              />
            </FormControl>
          </FlexGridItem>
        </FlexGrid>
      </FadeIn>
    )

  const customSummary = !isLoading && dataset && datasetId === 'custom' && (
    <FlexGrid flexGridColumnCount={[1, 1, 2]} flexGridColumnGap="scale600">
      <FlexGridItem>
        <FormControl label="Dataset" caption={() => <>Type or copy-paste custom text</>}>
          <Textarea
            onBlur={() => onDatasetChange('custom')}
            onChange={(e) => {
              setCustomDatasetText(e.target.value)
            }}
            placeholder="Type or copy-paste custom dataset text (preferably >10K characters)"
            value={customDatasetText}
            rows={7}
            size={inputSize}
          />
        </FormControl>
      </FlexGridItem>

      <FlexGridItem>
        <Block display="flex" flexDirection="row" gridGap="scale600">
          <Block flex="1">
            <FormControl label="Dataset size">
              <Count
                count={dataset?.dataSize}
                label="characters in total"
                hierarchy="secondary"
              />
            </FormControl>
          </Block>

          <Block flex="1">
            <FormControl label="Vocabulary size">
              <Count
                count={dataset?.vocabSize}
                label="unique characters"
                hierarchy="secondary"
              />
            </FormControl>
          </Block>
        </Block>

        <FormControl
          label="Vocabulary"
          caption="Unique characters (including line breaks and spaces)"
          disabled={!dataset.vocabulary}
        >
          <Textarea
            value={dataset.vocabulary?.join('')}
            rows={3}
            size={inputSize}
            readOnly
          />
        </FormControl>
      </FlexGridItem>
    </FlexGrid>
  )

  return (
    <Block>
      {segments}
      {loader}
      {error}
      {standardSummary}
      {customSummary}
    </Block>
  )
}
