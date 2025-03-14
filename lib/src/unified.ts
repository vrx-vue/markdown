import type { ElementContent, Nodes, Root } from 'hast'
import { Jsx, toJsxRuntime } from 'hast-util-to-jsx-runtime'
import { urlAttributes } from 'html-url-attributes'
import remarkParse from 'remark-parse'
import type { Options as RemarkRehypeOptions } from 'remark-rehype'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { BuildVisitor, visit } from 'unist-util-visit'
import { VFile } from 'vfile'
import { normalizeClass } from 'vue'
import { Fragment, JSX, jsx } from 'vue/jsx-runtime'
import type { IProps, UrlTransform } from './props'

const safeProtocol = /^(https?|ircs?|mailto|xmpp)$/i

const emptyRemarkRehypeOptions: Readonly<RemarkRehypeOptions> = { allowDangerousHtml: true }

const defaultUrlTransform: UrlTransform = (value) => {
  const colon = value.indexOf(':')
  const questionMark = value.indexOf('?')
  const numberSign = value.indexOf('#')
  const slash = value.indexOf('/')

  if (
    colon === -1 ||
    (slash !== -1 && colon > slash) ||
    (questionMark !== -1 && colon > questionMark) ||
    (numberSign !== -1 && colon > numberSign) ||
    safeProtocol.test(value.slice(0, colon))
  ) {
    return value
  }

  return ''
}

export const createUnified = (options: IProps, attrs: Record<string, unknown>): JSX.Element => {
  const allowedElements = options.allowedElements
  const allowElement = options.allowElement
  const disallowedElements = options.disallowedElements
  const rehypePlugins = options.rehypePlugins || []
  const remarkPlugins = options.remarkPlugins || []
  const remarkRehypeOptions = options.remarkRehypeOptions
    ? { ...options.remarkRehypeOptions, ...emptyRemarkRehypeOptions }
    : emptyRemarkRehypeOptions
  const skipHtml = options.skipHtml
  const unwrapDisallowed = options.unwrapDisallowed
  const urlTransform = options.urlTransform || defaultUrlTransform
  const processor = unified()
    .use(remarkParse)
    .use(remarkPlugins)
    .use(remarkRehype, remarkRehypeOptions)
    .use(rehypePlugins)
  const file = new VFile(options.content || '')
  const mdAstTree = processor.parse(file)
  let hastTree = processor.runSync(mdAstTree, file) as Nodes
  if (attrs.class) {
    hastTree = {
      type: 'element',
      tagName: 'div',
      properties: { className: normalizeClass(attrs.class) },
      children: (hastTree.type === 'root' ? hastTree.children : [hastTree]) as ElementContent[],
    }
  }

  const transform: BuildVisitor<Root> = (node, index, parent) => {
    // @ts-expect-error
    if (node?.properties?.className) {
      // @ts-expect-error
      node.properties.class = normalizeClass(node.properties.className)
      // @ts-expect-error
      node.properties.className = undefined
    }
    if (node.type === 'raw' && parent && typeof index === 'number') {
      if (skipHtml) {
        parent.children.splice(index, 1)
      } else {
        parent.children[index] = { type: 'text', value: node.value }
      }
      return index
    }

    if (node.type === 'element') {
      let key: string
      for (key in urlAttributes) {
        if (Object.hasOwn(urlAttributes, key) && Object.hasOwn(node.properties, key)) {
          const value = node.properties[key]
          const test = urlAttributes[key]
          if (test === null || test.includes(node.tagName)) {
            node.properties[key] = urlTransform(String(value || ''), key, node)
          }
        }
      }
    }

    if (node.type === 'element') {
      let remove = allowedElements
        ? !allowedElements.includes(node.tagName)
        : disallowedElements
          ? disallowedElements.includes(node.tagName)
          : false

      if (!remove && allowElement && typeof index === 'number') {
        remove = !allowElement(node, index, parent)
      }

      if (remove && parent && typeof index === 'number') {
        if (unwrapDisallowed && node.children) {
          parent.children.splice(index, 1, ...node.children)
        } else {
          parent.children.splice(index, 1)
        }

        return index
      }
    }
  }

  visit(hastTree, transform as any as BuildVisitor)

  const render: Jsx = (tag, props, key) => {
    const component = options.components?.[tag as string]
    if (!component) return jsx(tag, props, key)
    if (typeof component === 'function') return component(tag, props, key)
    if (typeof component === 'string') return jsx(component, props, key)
    return jsx(tag, props, key)
  }

  return toJsxRuntime(hastTree, {
    Fragment,
    jsx: render,
    jsxs: render,
    ignoreInvalidStyle: true,
    passKeys: true,
    passNode: true,
  }) as JSX.Element
}
