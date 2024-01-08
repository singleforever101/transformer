import { useEffect, useState } from 'react'

export const usePolling = (callback: () => void) => {
  const [isEnabled, setIsEnabled] = useState<boolean>(true)
  const [intervalSeconds, setIntervalSeconds] = useState<number>(1)

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null
    if (isEnabled) {
      intervalId = setInterval(() => {
        callback()
      }, intervalSeconds * 1000)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [isEnabled, intervalSeconds, callback])

  return { setIsEnabled, setIntervalSeconds }
}

export default usePolling
