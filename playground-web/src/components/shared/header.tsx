import { Block } from 'baseui/block'
import {
  HeaderNavigation,
  ALIGN,
  StyledNavigationList,
  StyledNavigationItem,
} from 'baseui/header-navigation'
import { StyledLink } from 'baseui/link'
import { GoHubot } from 'react-icons/go'
import GitHubButton from 'react-github-btn'

import { BASE_PATH, REPO_URL } from '../../config/links'
import { WINDOW_PADDING_HORIZONTAL } from '../../config/theme'

export function Header() {
  return (
    <Block marginBottom="scale800">
      <HeaderNavigation overrides={{ Root: { style: { borderBottomWidth: '2px' } } }}>
        <StyledNavigationList $align={ALIGN.left}>
          <StyledNavigationItem $style={{ paddingLeft: WINDOW_PADDING_HORIZONTAL }}>
            <Block
              display="flex"
              flexDirection="row"
              alignItems="center"
              justifyContent="center"
              $style={{ lineHeight: 0 }}
            >
              <Block marginRight="5px">
                <GoHubot size="20" />
              </Block>
              <StyledLink
                href={BASE_PATH}
                $style={{ textDecoration: 'none', fontWeight: 700 }}
              >
                Homemade GPT • JS
              </StyledLink>
            </Block>
          </StyledNavigationItem>
        </StyledNavigationList>

        {/* <StyledNavigationList $align={ALIGN.center} /> */}

        <StyledNavigationList $align={ALIGN.right}>
          <StyledNavigationItem $style={{ paddingRight: WINDOW_PADDING_HORIZONTAL }}>
            <Block
              display="flex"
              id="github-button"
              flexDirection="row"
              alignItems="center"
              justifyContent="center"
              $style={{ lineHeight: 0 }}
            >
              <GitHubButton
                href={REPO_URL}
                data-color-scheme="no-preference: light; light: light; dark: dark;"
                data-size="large"
                data-show-count="true"
                aria-label="Star trekhleb/homemade-gpt-js on GitHub"
              >
                Star
              </GitHubButton>
            </Block>
          </StyledNavigationItem>
        </StyledNavigationList>
      </HeaderNavigation>
    </Block>
  )
}
