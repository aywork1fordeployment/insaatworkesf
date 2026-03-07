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
  return url.replace('/upload/', `/upload/w_${width},q_auto,f_auto/`)
}