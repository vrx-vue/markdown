import { Element, Parents } from 'hast'
import type { Props } from 'hast-util-to-jsx-runtime'
import type { Options as RemarkRehypeOptions } from 'remark-rehype'
import type { PluggableList } from 'unified'
import type { JSX } from 'vue/jsx-runtime'

export type AllowElement = (
  element: Readonly<Element>,
  index: number,
  parent?: Readonly<Parents>
) => boolean | null | undefined
export type UrlTransform = (
  url: string,
  key: string,
  node: Readonly<Element>,
  parent?: Readonly<Parents>
) => string | null | undefined

export type Components =
  | Partial<{
      [TagName in keyof JSX.IntrinsicElements]:
        | ((props: Props, key?: string) => JSX.Element)
        | keyof JSX.IntrinsicElements
    }>
  | {
      [TagName: string]: ((props: Props, key?: string) => JSX.Element) | keyof JSX.IntrinsicElements
    }

export interface IProps {
  allowElement?: AllowElement
  allowedElements?: string[]
  disallowedElements?: string[]
  remarkPlugins?: PluggableList
  rehypePlugins?: PluggableList
  remarkRehypeOptions?: RemarkRehypeOptions
  skipHtml?: boolean
  unwrapDisallowed?: boolean
  urlTransform?: UrlTransform
  components?: Components
  content?: string
}
