/**
 * Helper functions for custom layers and models.
 * These utils are generic and have nothing to do with GPT model itself.
 */
import * as tf from '@tensorflow/tfjs'
import { Layer, LayerLike, Model, NumericWeights, LayerChildren, Weights } from './types'

export function withModelHelpers(model: Model, children: LayerChildren): Model {
  return {
    ...model,
    dispose: () => dispose(children.flat()),
    getWeights: async () => {
      const weights: Weights = {}
      const layers = flatChildren(children)
      for (const layer of layers) {
        weights[layer.name] = await getWeights(layer)
      }
      return truncateFloats(weights)
    },
    setWeights: (weights: Weights) => {
      const layers =  flatChildren(children)
      for (const layer of layers) {
        const wArr = weights[layer.name]
        if (!wArr) {
          console.error(new Error(`Cannot find weights for layer ${layer.name}`))
          continue
        }
        const wTens = wArr.map((w) => tf.tensor(w))
        layer.setWeights(wTens)
        wTens.forEach((tensor) => tensor.dispose())
      }
    }
  }
}

export function withLayerHelpers(layer: Layer, children: LayerChildren): Layer {
  return {
    ...layer,
    countParams: () => countParams(children.flat()),
    dispose: () => dispose(children.flat()),
    getChildren: () => children,
  }
}

export function dispose(layers: (null | LayerLike)[]) {
  layers.forEach((layer) => layer?.dispose?.())
}

export function countParams(layers: LayerLike[]): number {
  return tf.tidy(() => {
    return layers.reduce((count, layer) => {
      if (!('countParams' in layer)) return count
      return count + (layer?.countParams?.() || 0)
    }, 0)
  })
}

async function getWeights(layer: tf.layers.Layer): Promise<NumericWeights> {
  const promisedWeights = layer.getWeights() || []
  const resolvedWeights = await Promise.all(promisedWeights.map((w) => w.array()))
  return resolvedWeights
}

function flatChildren(children: LayerChildren): tf.layers.Layer[] {
  const layers: tf.layers.Layer[] = []
  for (const child of children) {
    // If TensorFlow layer
    if ('trainable' in child) {
      layers.push(child)
    }
    // If custom layer
    else if ('getChildren' in child) {
      flatChildren(child.getChildren?.() || []).forEach((childLayer) => {
        layers.push(childLayer)
      })
    }
    // If array of layers
    else if (Array.isArray(child)) {
      flatChildren(child).forEach((childLayer) => {
        layers.push(childLayer)
      })
    }
  }
  return layers
}

// Truncates the weights of the layers to `fractionDigits` number of
// digits after the floating point (to reduce the checkpoint file size).
// Be aware, that this would increase the model loss after checkpoint import.
function truncateFloats(obj: any, fractionDigits: number = 8): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => truncateFloats(item))
  } else if (typeof obj === 'object' && obj !== null) {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        obj[key] = truncateFloats(obj[key])
      }
    }
    return obj
  } else if (typeof obj === 'number' && !Number.isInteger(obj)) {
    return parseFloat(obj.toFixed(fractionDigits))
  }
  return obj
}
