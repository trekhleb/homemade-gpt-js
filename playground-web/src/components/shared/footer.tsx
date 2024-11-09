import { Block } from 'baseui/block'
import { Button, SHAPE, KIND } from 'baseui/button'
import { IoLogoGithub } from 'react-icons/io'
import { FaXTwitter } from 'react-icons/fa6'
import { REPO_URL, X_URL } from '../../config/links'

export function Footer() {
  return (
    <Block
      display="flex"
      marginBottom="scale1000"
      flexDirection="column"
    >
      <Block
        marginTop="scale1000"
        paddingTop="scale1000"
        display="flex"
        flexDirection="row"
        gridGap="5px"
        justifyContent="center"
        $style={{ borderTop: '2px solid #F3F3F3' }}
      >
        <Button
          $as="a"
          href={REPO_URL}
          shape={SHAPE.circle}
          kind={KIND.tertiary}
          target="_blank"
        >
          <IoLogoGithub size={26} />
        </Button>
        <Button
          $as="a"
          href={X_URL}
          shape={SHAPE.circle}
          kind={KIND.tertiary}
          target="_blank"
        >
          <FaXTwitter size={23} />
        </Button>
      </Block>
    </Block>
  )
}
