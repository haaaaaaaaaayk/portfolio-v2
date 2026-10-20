/** Tool docks, the variant switcher, and dialogs — not the glass itself. */
export function isChromeTarget(t: EventTarget | null): boolean {
  return (
    t instanceof Element &&
    !!t.closest('[data-switcher], [data-chrome], [role="dialog"], input, textarea, select')
  )
}

export function downloadPng(dataUrl: string, filename: string) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  a.rel = 'noopener'
  a.click()
}

export function loadImageFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('not an image'))
      return
    }
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('image load failed'))
    }
    img.src = url
  })
}

/** Drop-anywhere photo, plus a hidden file input trigger. */
export function bindPhotoDrop(
  onImg: (img: HTMLImageElement) => void,
): () => void {
  const onDrag = (e: DragEvent) => {
    e.preventDefault()
  }
  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer?.files?.[0]
    if (!file) return
    void loadImageFile(file).then(onImg).catch(() => {})
  }
  window.addEventListener('dragover', onDrag)
  window.addEventListener('drop', onDrop)
  return () => {
    window.removeEventListener('dragover', onDrag)
    window.removeEventListener('drop', onDrop)
  }
}
