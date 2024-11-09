import { Block } from 'baseui/block'
import React from 'react'
import { Client as Styletron } from 'styletron-engine-monolithic'
import { Provider as StyletronProvider } from 'styletron-react'
import { BaseProvider, createLightTheme } from 'baseui'
import { SnackbarProvider } from 'baseui/snackbar'
import './layout.css'
import { colors } from 'baseui/tokens'
import { Header } from './header'

const engine = new Styletron()

const theme = createLightTheme({
  colors: {
    linkVisited: colors.black,
  },
})

type LayoutProps = {
  children: React.ReactNode
}

export function Layout(props: LayoutProps) {
  const { children } = props
  return (
    <StyletronProvider value={engine}>
      <BaseProvider theme={theme}>
        <SnackbarProvider>
          <Block display="flex" flexDirection="column" alignItems="center">
            <Block display="flex" flexDirection="column" width="100%" maxWidth="1200px">
              <Header />
              {children}
            </Block>
          </Block>
        </SnackbarProvider>
      </BaseProvider>
    </StyletronProvider>
  )
}
