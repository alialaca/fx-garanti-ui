type EventName =
  | 'search'
  | 'registration-start'
  | 'registration-otp-request'
  | 'registration-complete'
  | 'warranty-view'
  | 'theme-change'
  | 'exclusions-view'
  | 'footer-link-click'
  | 'admin-login-success'
  | 'admin-login-fail'
  | 'admin-search'
  | 'admin-filter'

declare global {
  interface Window {
    umami?: {
      track: (name: string, data?: Record<string, unknown>) => void
    }
  }
}

export const useTracking = () => {
  const trackEvent = (name: EventName, data?: Record<string, unknown>) => {
    window.umami?.track(name, data)
  }

  return { trackEvent }
}
