import React from 'react'
import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-wasm'
import '@tensorflow/tfjs-backend-webgpu'
import { setWasmPaths } from '@tensorflow/tfjs-backend-wasm'
import { Block } from 'baseui/block'
import { BackendId } from '../types/playground'
import { ProgressBar, SIZE } from 'baseui/progress-bar'
import { SegmentedControl, Segment } from 'baseui/segmented-control'
import { BASE_PATH } from '../config/links'
import { IoRocketSharp } from 'react-icons/io5'
import { ReactComponent as TurtleIcon } from '../assets/turtle.svg'
import { Notification } from './shared/notification'
import { FadeIn } from './shared/fade'

type BackendProps = {
  backend: BackendId | undefined
  onChange?: (backend: BackendId) => Promise<void>
}

export function Backend(props: BackendProps) {
  const { backend, onChange = () => {} } = props

  const [errorMessage, setErrorMessage] = React.useState<string>()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  const [hasWebGL, setHasWebGL] = React.useState<boolean>()
  const [hasWebGPU, setHasWebGPU] = React.useState<boolean>()
  const [hasWASM, setHasWASM] = React.useState<boolean>()

  const onBackendInit = async () => {
    setIsLoading(true)
    try {
      // For WASM backend, set the path to the public folder where `.wasm` files are located
      setWasmPaths(BASE_PATH + '/')
      await tf.ready()
      const detectedBackend = Object.keys(tf.engine().registry)[0] as BackendId
      await onChange(detectedBackend)
    } catch (err) {
      setErrorMessage((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const onBackendChange = async (nextBackend: BackendId) => {
    setIsLoading(true)
    setErrorMessage(undefined)
    try {
      const success = await tf.setBackend(nextBackend)
      await tf.ready()
      if (!success) {
        throw new Error(`Cannot set a ${nextBackend} backend`)
      }
      onChange(nextBackend)
    } catch (err) {
      setErrorMessage((err as Error).message)
    }
    setIsLoading(false)
  }

  React.useEffect(() => {
    setHasWebGL(isWebGLSupported())
    setHasWebGPU(isWebGPUSupported())
    setHasWASM(isWASMSupported())
    onBackendInit()
  }, [])

  const error = errorMessage && (
    <Notification kind="negative">{errorMessage}</Notification>
  )

  const loader = isLoading && (
    <FadeIn>
      <ProgressBar
        infinite
        size={SIZE.small}
        getProgressLabel={() => 'Setting the TensorFlow backend...'}
        showLabel
        overrides={{ BarContainer: { style: { marginLeft: 0, marginRight: 0 } } }}
      />
    </FadeIn>
  )

  const segments = (
    <FadeIn>
      <SegmentedControl
        activeKey={backend}
        disabled={isLoading}
        onChange={({ activeKey }) => {
          onBackendChange(activeKey as BackendId)
        }}
      >
        {(Object.keys(BACKENDS) as BackendId[]).map((backendId) => {
          const disabled =
            (backendId === 'webgl' && !hasWebGL) ||
            (backendId === 'webgpu' && !hasWebGPU) ||
            (backendId === 'wasm' && !hasWASM)
          return (
            <Segment
              key={backendId}
              disabled={disabled}
              label={BACKENDS[backendId].label}
              description={BACKENDS[backendId].description}
            />
          )
        })}
      </SegmentedControl>
    </FadeIn>
  )

  const noGPUSupportWarning =
    !hasWebGL && !hasWebGPU ? (
      <Notification kind="warning">
        Looks like your browser doesn't support neither WebGPU nor WebGL. Training on CPU
        or WASM might be slow.
      </Notification>
    ) : null

  const slowCPUWarning = ['cpu', 'wasm', 'webgl'].includes(backend || '') ? (
    <Notification kind="warning">
      Training on <b>{backend?.toUpperCase()}</b> might be slow. The recommended setup is
      to use a device and browser that support <b>WebGPU</b>.
    </Notification>
  ) : null

  return (
    <Block>
      {segments}
      {error}
      {noGPUSupportWarning || slowCPUWarning}
      {loader}
    </Block>
  )
}

export const BACKENDS: Record<
  BackendId,
  {
    label: string
    description?: React.ReactNode
  }
> = {
  cpu: {
    label: 'CPU',
    description: (
      <SegmentDescription>
        <TurtleIcon width="16" />
        <TurtleIcon width="16" />
      </SegmentDescription>
    ),
  },
  wasm: {
    label: 'WASM',
    description: (
      <SegmentDescription>
        <TurtleIcon width="16" />
      </SegmentDescription>
    ),
  },
  webgl: {
    label: 'WebGL',
    description: (
      <SegmentDescription>
        <IoRocketSharp size={13} />
      </SegmentDescription>
    ),
  },
  webgpu: {
    label: 'WebGPU',
    description: (
      <SegmentDescription>
        <IoRocketSharp size={13} />
        <IoRocketSharp size={13} />
      </SegmentDescription>
    ),
  },
}

function SegmentDescription({ children }: { children: React.ReactNode }) {
  return (
    <Block
      display="flex"
      flexDirection="row"
      justifyContent="center"
      marginTop="8px"
      gridGap="2px"
    >
      {children}
    </Block>
  )
}

function isWebGLSupported() {
  try {
    const canvas = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')))
  } catch (err) {
    return false
  }
}

function isWebGPUSupported() {
  try {
    return !!navigator.gpu
  } catch (err) {
    return false
  }
}

function isWASMSupported() {
  return typeof WebAssembly === 'object' && typeof WebAssembly.instantiate === 'function'
}

