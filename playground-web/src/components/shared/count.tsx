import { Block } from 'baseui/block'
import { LabelLarge } from 'baseui/typography'
import { formatNumber } from '../../utils/string'

type CountProps = {
  count: number | undefined
  label: string
  description?: string
  hierarchy?: 'primary' | 'secondary'
}

export function Count(props: CountProps) {
  const { count, label, description, hierarchy = 'primary' } = props

  const labelBlock = label ? (
    <Block
      color={hierarchy === 'primary' ? 'black' : 'grey'}
      $style={{ fontSize: hierarchy === 'primary' ? '13px' : '12px', lineHeight: '14px' }}
    >
      {label}
    </Block>
  ) : null

  const descriptionBlock = description ? (
    <Block color="grey" $style={{ fontSize: '12px' }} marginTop="-1px">
      {description}
    </Block>
  ) : null

  return (
    <Block display="flex" flexDirection="row" gridGap="scale400" alignItems="center">
      <LabelLarge $style={{ fontSize: '30px' }}>{formatNumber(count)}</LabelLarge>
      <Block display="flex" flexDirection="column">
        {labelBlock}
        {descriptionBlock}
      </Block>
    </Block>
  )
}
