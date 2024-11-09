import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Block } from 'baseui/block'
import { MonoLabelSmall } from 'baseui/typography'
import './clock.css'
import { formatTime } from '../../utils/string'
import { FadeIn } from './fade'

type ClockProps = {
  animated?: boolean
  timeMs?: number | undefined
  ticking?: boolean
}

const interval = 1000

export function Clock(props: ClockProps) {
  const { animated = false, timeMs = undefined, ticking = false } = props

  const [timePassed, setTimePassed] = useState<number>(0)
  const timePassedRef = useRef<number>(0)

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const onInterval = () => {
    timePassedRef.current += interval
    setTimePassed(timePassedRef.current)
  }

  const onIntervalCallback = useCallback(onInterval, [interval])

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    timePassedRef.current = 0
    setTimePassed(0)
    timerRef.current = setInterval(onIntervalCallback, interval)
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [onIntervalCallback, interval])

  let timeBlock = null
  if (timeMs) {
    timeBlock = (
      <FadeIn>
        <MonoLabelSmall $style={{ fontSize: '13px' }}>
          <b>{formatTime(timeMs)}</b>
        </MonoLabelSmall>
      </FadeIn>
    )
  } else if (ticking) {
    timeBlock = (
      <FadeIn>
        <MonoLabelSmall $style={{ fontSize: '13px' }}>
          <b>{formatTime(timePassed)}</b>
        </MonoLabelSmall>
      </FadeIn>
    )
  }

  return (
    <Block display="flex" flexDirection="row" alignItems="center">
      <Block marginRight="5px">
        <div
          className={
            animated
              ? 'timer-loader timer-loader-animated'
              : 'timer-loader timer-loader-static'
          }
        />
      </Block>
      {timeBlock}
    </Block>
  )
}
