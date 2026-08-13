const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid']
const STORAGE_KEY = 'expedicao-utm-params'

export function captureAndSaveUtms() {
  const params = new URLSearchParams(window.location.search)
  const fresh = {}
  UTM_KEYS.forEach((k) => { if (params.has(k)) fresh[k] = params.get(k) })
  if (Object.keys(fresh).length > 0) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh))
  }
}

export function getStoredUtms() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {} }
  catch { return {} }
}
