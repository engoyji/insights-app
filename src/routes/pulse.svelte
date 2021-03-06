<script context="module">
  import { client } from '@/apollo'
  import { checkGDPR } from '@/logic/gdpr'
  import { getPulseInsights, extractURLTags } from '@/logic/insights'

  export async function preload(page, session, { apollo = client }) {
    await session.loadingUser
    if (checkGDPR(session.currentUser, this)) {
      return
    }

    const tags = extractURLTags(page.query.tags)

    return {
      insights: await getPulseInsights({ page: 1, tags }, apollo),
      tags,
    }
  }
</script>

<script>
  import Feed from '@/components/Feed'
  import ViewportObserver from '@/components/ViewportObserver'
  import PulseCard from '@/components/insights/PulseCard'
  import { publishDateSorter } from '@/utils/insights'

  const options = {
    rootMargin: '650px',
  }

  export let insights = []
  export let tags = undefined

  $: insights = [...insights].sort(publishDateSorter)

  let page = 1
  let loading = false
  let hasMore = true

  function loadInsights() {
    loading = true
    page = page + 1

    return getPulseInsights({
      page,
      tags,
    }).then((newInsights) => {
      if (newInsights.length === 0) {
        hasMore = false
      } else {
        insights = insights.concat(newInsights)
      }

      loading = false
    })
  }

  function onIntersect() {
    if (hasMore && !loading) {
      loadInsights()
    }
  }
</script>

<template lang="pug">
include /ui/mixins

svelte:head
  title Insights
  meta(property='og:title', content='Insights')
  meta(name='description', content='All Community Insights')
  meta(property='og:description', content='All Commmunity Insights')

.insights.bot-scroll
  .insights__all
    ViewportObserver({options}, on:intersect='{onIntersect}', observeWhile='{hasMore}')
      Feed(items="{insights}", dateKey="publishedAt", preIndex='{4}')
        div.insights__item(slot="item", let:item="{insight}")
          PulseCard({insight})
        
</template>

<style lang="scss">
  @import '@/mixins';

  $mob-card-height: 139;

  .insights {
    display: flex;

    &__all {
      max-width: 100%;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    &__item {
      margin-bottom: 24px;
      width: 100%;
    }
  }
</style>
