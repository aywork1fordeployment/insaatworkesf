const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export const uploadImage = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('folder', 'esf-products')

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  })

  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.secure_url
}

export const optimizeUrl = (url, width = 400) => {
  if (!url) return null
  if (!url.includes('cloudinary.com')) return url
  return url.replace('/upload/', `/upload/w_${width},q_auto,f_auto/`)
}

export const getResponsiveSrcSet = (url) => {
  if (!url) return { src: null, srcSet: '', sizes: '' }
  if (!url.includes('cloudinary.com')) return { src: url, srcSet: '', sizes: '' }
  
  const widths = [150, 300, 600, 1200]
  
  const srcSet = widths
    .map(w => {
      const optimized = url.replace('/upload/', `/upload/w_${w},q_auto,f_auto/`)
      return `${optimized} ${w}w`
    })
    .join(', ')
  
  return {
    src: optimizeUrl(url, 300), // Fallback
    srcSet,
    sizes: '(max-width: 640px) 150px, (max-width: 1024px) 300px, 600px'
  }
}