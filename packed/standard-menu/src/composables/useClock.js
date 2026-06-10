import { ref, onMounted, onUnmounted } from 'vue'
import dayjs from 'dayjs'

export function useClock(format = 'MM月DD日 HH:mm') {
  const now = ref(dayjs().format(format))
  let timer = null

  const tick = () => { now.value = dayjs().format(format) }

  onMounted(() => { timer = window.setInterval(tick, 1000) })
  onUnmounted(() => { timer && clearInterval(timer) })

  return { now }
}
