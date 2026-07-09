export default defineNuxtPlugin(async () => {
  const { getSession } = useAuth()
  await getSession()
})
