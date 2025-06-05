import { CLOUD_NAME, UPLOAD_PRESET } from '../constants'

export const uploadToCloudinary = async (file) => {
  if (!file) throw new Error('No file provided for upload.')

  console.log('Uploading file to Cloudinary:', file.type)

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`,
    {
      method: 'POST',
      body: formData,
    }
  )

  console.log(response, 'response from cloudinary upload')

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error?.message || 'Cloudinary upload failed.')
  }

  const result = await response.json()
  return result.secure_url
}
