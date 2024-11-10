import coverImg from '../../assets/cover.jpg'
import coverImgBg from '../../assets/cover-bg.jpg'
import { ParagraphSmall } from 'baseui/typography'
import { Block } from 'baseui/block'
import { Card } from 'baseui/card'
import { GPT_MODEL_FILE_PATH, KARPATHY_MIN_GPT_REPO_PATH } from '../../config/links'
import { CSSProperties } from 'react'
import { StyleObject } from 'styletron-react'

export function Banner() {
  const paragraphStyle: StyleObject = { color: 'white', lineHeight: '23px' }
  const linkStyle: CSSProperties = {
    color: 'white',
    fontWeight: 600,
    textUnderlineOffset: '3px',
    textDecorationThickness: '1.5px',
  }

  return (
    <Block marginBottom="scale800">
      <Card
        overrides={{
          Contents: { style: { padding: 0, margin: 0 } },
          Body: { style: { padding: 0, margin: 0 } },
          Root: { style: { borderWidth: 0 } },
        }}
      >
        <Block
          display="flex"
          flexDirection={['column', 'column', 'column', 'row']}
          gridGap={['1px', '2px', '3px', '3px']}
          overflow="hidden"
        >
          <Block flex="2" display="flex">
            <img src={coverImg} width="100%" title="Homemade GPT JS" />
          </Block>
          <Block
            flex="1"
            display="flex"
            backgroundImage={`url(${coverImgBg})`}
            backgroundSize="cover"
            backgroundPosition="right"
          >
            <Block
              flex="1"
              paddingLeft="scale600"
              backgroundColor="rgba(27, 19, 14, 0.4)"
              color="white"
              paddingRight="scale600"
              $style={{ backdropFilter: 'blur(30px)' }}
            >
              <ParagraphSmall $style={paragraphStyle}>
                A minimal TensorFlow.js re-implementation of Karpathy's{' '}
                <a href={KARPATHY_MIN_GPT_REPO_PATH} style={linkStyle}>
                  minGPT
                </a>{' '}
                (Generative Pre-trained Transformer).
              </ParagraphSmall>

              <ParagraphSmall $style={paragraphStyle}>
                A full definition of this "homemade" GPT language model (all of it) can be
                found in this single{' '}
                <a href={GPT_MODEL_FILE_PATH} style={linkStyle}>
                  model.ts
                </a>{' '}
                file (less than 300 lines of code).
              </ParagraphSmall>

              <ParagraphSmall $style={paragraphStyle}>
                Since{' '}
                <a href={GPT_MODEL_FILE_PATH} style={linkStyle}>
                  model.ts
                </a>{' '}
                is written in TypeScript, you can use this playground to train it and
                generate its predictions directly in the browser using a GPU.
              </ParagraphSmall>

              <ParagraphSmall $style={paragraphStyle}>
                The model and the playground are written for learning purposes, to
                understand how GPT works and to use WebGPU for training.
              </ParagraphSmall>
            </Block>
          </Block>
        </Block>
      </Card>
    </Block>
  )
}
