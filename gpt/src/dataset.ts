/**
 * Nothing specific to GPT here, only a generic character-level
 * dataset wrapper.
 *
 * A helper wrapper on top of any .txt file data-set.
 * It loads the file, splits it into training and testing batches,
 * encodes/decodes letter to indices and vice versa.
 */
import * as tf from '@tensorflow/tfjs'
import { Dataset, DatasetGetBatchParams, DatasetParams } from './types'

// Creates a character-level dataset, where each letter is a token.
export async function CharDataset(args: DatasetParams): Promise<Dataset> {
  const { textSourceURL, textSource = '', maskZero = true } = args

  // Whether to use 0-based or 1-based (0 is for masking) index.
  const indexShift = maskZero ? 1 : 0

  const text: string = textSourceURL ? await (await fetch(textSourceURL)).text() : textSource
  const textSize: number = text.length

  const chars: string[] = Array.from(new Set(text)).sort()
  const vocabSize: number = chars.length

  // Data encoders/decoders
  const stoi = Object.fromEntries(chars.map((ch, i) => [ch, i + indexShift]))
  const itos = Object.fromEntries(chars.map((ch, i) => [i + indexShift, ch]))

  const encode = (s: string) => s.split('').map((c) => stoi[c])
  const decode = (a: number[]) => a.map((i) => itos[i]).join('')

  // Train and test splits
  const data = tf.tensor(encode(text), [textSize], 'int32')
  const dataSize: number = data.shape[0]
  const n = Math.floor(0.9 * textSize)
  const trainData: tf.Tensor = data.slice(0, n)
  const valData: tf.Tensor = data.slice(n)

  const getBatch = (args: DatasetGetBatchParams) =>
    tf.tidy(() => {
      const { split, blockSize, batchSize } = args

      const data = split === 'train' ? trainData : valData
      const maxval = data!.shape[0] - blockSize
      const ix = tf.randomUniform([batchSize], 0, maxval, 'int32') // (B)
      const ranges = tf.range(0, blockSize, 1, 'int32').expandDims(0) // (1,T)
      const indices = ix.expandDims(1).add(ranges) // (B,T)
      const x = tf.gather(data!, indices) // (B,T)
      const y = tf.gather(data!, indices.add(tf.scalar(1, 'int32'))) // (B,T)
      return { x, y }
    })

  const dispose = () => {
    data.dispose()
    trainData.dispose()
    valData.dispose()
  }

  return {
    textSourceURL,
    vocabSize,
    vocabulary: chars,
    dataSize,
    text,
    getBatch,
    encode,
    decode,
    dispose,
  }
}
