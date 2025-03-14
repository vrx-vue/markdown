<script setup lang="tsx">
  import { computed, useAttrs } from 'vue'
  import type { IProps } from './props'
  import { createUnified } from './unified'

  const props = withDefaults(defineProps<IProps>(), {
    disallowedElements: () => [],
    remarkPlugins: () => [],
    rehypePlugins: () => [],
    skipHtml: false,
    unwrapDisallowed: false,
  })

  const attrs = useAttrs()

  const children = computed(() => createUnified(props, attrs))

  defineRender(() => children.value)
</script>
