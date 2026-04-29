export function cn(...inputs) {
  return inputs
    .filter(Boolean)
    .map((item) => {
      if (typeof item === 'string') return item
      if (typeof item === 'object') {
        return Object.entries(item)
          .filter(([, value]) => value)
          .map(([key]) => key)
          .join(' ')
      }
      return ''
    })
    .join(' ')
}
