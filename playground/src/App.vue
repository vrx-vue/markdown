<script setup lang="ts">
  import { Components, Markdown } from 'vrx-markdown'
  import remarkGfm from 'remark-gfm'
  import rehypeRaw from 'rehype-raw'
  import rehypeHighlight from 'rehype-highlight'
  import { jsx } from 'vue/jsx-runtime'
  import 'highlight.js/styles/github-dark.css'
  import { onMounted, ref } from 'vue'

  // @ts-expect-error
  import md from '../../README.md?raw'

  const content = ref('')

  let timer: any
  const components: Components = {
    code: (tag, props, key) => {
      return jsx(tag, props, key)
    },
  }

  onMounted(() => {
    timer = setInterval(() => {
      if (content.value.length >= md.length) {
        clearInterval(timer)
        return
      }
      content.value += (md as string).slice(content.value.length, content.value.length + 1)
      window.scrollTo(0, document.body.scrollHeight)
    }, 20)
  })
</script>
<template>
  <Markdown
    :content
    :remarkPlugins="[remarkGfm]"
    :rehypePlugins="[rehypeRaw, rehypeHighlight]"
    :components
  />
</template>
