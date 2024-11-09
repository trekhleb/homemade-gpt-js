import React, { ReactNode } from 'react'
import { styled } from 'styletron-react'

interface FadeInProps {
  children: ReactNode
}

const FadeInWrapper = styled('div', () => ({
  animationName: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  animationDuration: `400ms`,
  animationTimingFunction: 'ease-in-out',
  animationFillMode: 'forwards',
  opacity: 0,
}))

export const FadeIn: React.FC<FadeInProps> = ({ children }) => (
  <FadeInWrapper>{children}</FadeInWrapper>
)
