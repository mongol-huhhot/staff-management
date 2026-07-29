<!-- src/utils/SnackBar.vue -->
<script>
import { ElNotification } from 'element-plus'

const TYPE_MAP = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error',
}

export const showSnackbar = (message, level = 'info') => {
  ElNotification({
    title: '',
    message,
    type: TYPE_MAP[level] || 'info',
    position: 'top-right',
  })
}

export default {
  name: 'SnackBar',
}
</script>
