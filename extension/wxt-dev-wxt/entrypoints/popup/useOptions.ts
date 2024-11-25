import { useEffect, useState } from 'react'
import { storage } from 'wxt/storage'

export function useOptions() {
  const [options, setOptions] = useState({
    theme: 'light',
    notifications: true
  })

  useEffect(() => {
    const loadOptions = async () => {
      const savedOptions = await storage.getItem('local:options')
      if (savedOptions) {
        setOptions(savedOptions)
      }
    }

    const unwatch = storage.watch('local:options', (newOptions) => {
      if (newOptions) {
        setOptions(newOptions)
      }
    })

    loadOptions()
    return () => unwatch()
  }, [])

  const updateOptions = async (newOptions: typeof options) => {
    await storage.setItem('local:options', newOptions)
    setOptions(newOptions)
  }

  return { options, updateOptions }
}
