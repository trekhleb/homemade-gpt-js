import { ConfigurationOverride } from 'baseui/helpers/overrides'
import { Notification as BaseNotification, KIND } from 'baseui/notification'

type NotificationProps = {
  kind: (typeof KIND)[keyof typeof KIND]
  children: React.ReactNode
  style?: ConfigurationOverride
}

export function Notification(props: NotificationProps) {
  const { kind, children, style = {} } = props

  return (
    <BaseNotification
      overrides={{
        Body: {
          style: {
            width: 'auto',
            marginLeft: 0,
            marginRight: 0,
            marginBottom: 0,
            fontSize: '14px',
            ...style,
          },
        },
      }}
      kind={kind}
    >
      {children}
    </BaseNotification>
  )
}
