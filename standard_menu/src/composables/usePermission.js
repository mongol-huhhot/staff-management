// src/composables/usePermission.js
/**
 * @param {import('vue').Ref<string>} userIdRef
 * @param {import('vue').Ref<string>} userTypeRef   comma-separated
 * @returns {{ isDisabled(item: any): boolean }}
 */
export function usePermission(userIdRef, userTypeRef) {
  function isDisabled(item = {}) {
    /* ---------- Rule 0 : explicit flag ----------------------------- */
    if (item.disabled) return true      // passes → disabled

    /* ---------- Prepare data --------------------------------------- */
    const uid      = userIdRef.value ?? ''
    const myGroups = (userTypeRef.value ?? '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    /* ---------- Rule 1 : user list --------------------------------- */
    if (Array.isArray(item.users) && item.users.length) {
      const inUsers = item.users.includes(uid)
      if (inUsers) return false          // passes → enabled
    }

    /* ---------- Rule 2 : group list -------------------------------- */
    if (Array.isArray(item.user_group) && item.user_group.length) {
      const overlap = item.user_group.some(g => myGroups.includes(g))
      if (overlap) return false          // passes → enabled
    }

    /* ---------- If any filter existed and none passed -------------- */
    if (
      (item.users && item.users.length) ||
      (item.user_group && item.user_group.length)
    ) {
      return true                       // both filters failed
    }

    /* ---------- No restrictions defined → enabled ------------------ */
    return false
  }

  return { isDisabled }
}
