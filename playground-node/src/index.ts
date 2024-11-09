import * as tf from '@tensorflow/tfjs-node'
import { CONFIG, GPT, CharDataset, Trainer } from '@gpt/model'

async function start() {
  const backend = tf.getBackend()
  console.log(`Current backend: ${backend}`)

  const textSourceURL = 'https://raw.githubusercontent.com/trekhleb/homemade-gpt-js/refs/heads/main/playground-web/public/dataset-tinyshakespeare.txt'
  const dataset = await CharDataset({ textSourceURL })

  const batchSize = 8
  const blockSize = 8
  const maxIters = 1800
  const evalInterval = 300
  const evalIterations = 50
  const learningRate = 1e-3

  const model = GPT({
    ...CONFIG['gpt-pico'],
    blockSize,
    vocabSize: dataset.vocabSize,
  })
  console.log('\nModel summary:', model.summary())

  console.log('\nStart training:')
  const trainer = Trainer({
    model,
    dataset,
    params: {
      learningRate,
      evalInterval,
      evalIterations,
      maxIters,
      batchSize,
      blockSize,
    },
    callbacks: {
      onEval: (params) => {
        console.log(params)
      },
    },
  })
  await trainer.train()

  console.log('\nStart generation:')
  const generated = await model.generate({
    idx: tf.ones([1, 1], 'int32'),
    maxNewTokens: 500,
    doSample: true,
    topK: undefined,
  })
  console.log(dataset.decode(((await generated.array()) as number[][])[0]))

  console.log('\nDisposing the model and dataset')
  dataset.dispose()
  generated.dispose()
  model?.dispose?.()

  console.log('\nDebug memory consumption:')
  console.table(tf.memory())
}

start()
