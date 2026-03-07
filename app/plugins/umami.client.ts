export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const scriptUrl = config.public.umamiScriptUrl as string
  const websiteId = config.public.umamiWebsiteId as string

  if (!scriptUrl || !websiteId) return

  useHead({
    script: [
      {
        src: scriptUrl,
        async: true,
        defer: true,
        'data-website-id': websiteId,
      },
    ],
  })
})
