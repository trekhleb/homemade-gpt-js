import { Block } from 'baseui/block'
import { Card } from 'baseui/card'
import { Accordion, Panel } from 'baseui/accordion'

type StepProps = {
  title: string
  children: React.ReactNode
  accordion?: boolean
  closed?: boolean
}

export function Step(props: StepProps) {
  const { title, children, accordion = false, closed = false } = props
  return (
    <Block marginBottom="scale800">
      <Card>
        <Accordion
          accordion={accordion}
          initialState={{ expanded: closed ? [] : ['panel'] }}
          renderAll
          overrides={{
            Header: {
              style: {
                margin: 0,
                padding: 0,
                fontSize: '20px',
                fontWeight: 700,
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
          <Panel key="panel" title={title}>
            {children}
          </Panel>
        </Accordion>
      </Card>
    </Block>
  )
}
