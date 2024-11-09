/**
 * Simple training loop, that could apply to any arbitrary neural network,
 * so nothing in this file really has anything to do with GPT specifically.
 * 
 * See the following repositories for reference:
 * - https://github.com/karpathy/ng-video-lecture
 * - https://github.com/karpathy/nanoGPT
 * - https://github.com/karpathy/minGPT
 */
import * as tf from '@tensorflow/tfjs'
import { Dataset, Model, TrainingCallbacks, TrainingParams } from './types'

export function Trainer(args: { model: Model, dataset: Dataset, callbacks: TrainingCallbacks, params: TrainingParams }) {
  const { model, dataset, callbacks, params } = args 
  const { evalIterations, learningRate, evalInterval, maxIters, batchSize, blockSize } = params

  const train = async () => {
    const optimizer = model.optimizer({ learningRate })

    const estimateLoss = () => tf.tidy(() => {
      const result: { train?: tf.Tensor; test?: tf.Tensor } = {}
      for (const split of ['train', 'test'] as ('train' | 'test')[]) {
        let losses = tf.zeros([1])
        for (let iter = 0; iter < evalIterations; iter++) {
          const { x, y } = dataset.getBatch({ split, batchSize, blockSize })
          const loss = model.loss(x, y)
          losses = losses.add(loss!)
        }
        result[split] = losses.div(evalIterations)
      }
      return result
    })

    for (let iter = 0; iter < maxIters; iter++) {
      // Every once in a while evaluate the loss on train and val sets
      if (iter === 0 || (iter + 1) % evalInterval === 0 || iter === maxIters - 1) {
        const { test, train } = estimateLoss()

        const testLoss = parseFloat((await test!.data())[0]?.toFixed(4))
        const trainLoss = parseFloat((await train!.data())[0]?.toFixed(4))

        callbacks.onEval({ step: iter + 1, trainLoss, testLoss })

        test?.dispose()
        train?.dispose()
      }

      // Sample a batch of data
      const { x, y } = dataset.getBatch({ split: 'train', batchSize, blockSize })

      // Evaluate the loss
      optimizer.minimize(() => {
        const loss = model.loss(x, y)
        return loss.squeeze()
      })

      x.dispose()
      y.dispose()
      if (callbacks?.isStopRequested?.()) break

      // Unblock the main thread (allow the UI to be re-rendered)
      // if the training is running in the browser
      await tf.nextFrame()
    }

    optimizer.dispose()
  }

  return { train }
}
