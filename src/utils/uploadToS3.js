import { API_BASE_URL } from '../constants'

export const uploadToS3 = async (file) => {
  if (!file) throw new Error('No file provided for upload.')

  console.log('Uploading file to s3:', file.type)

  const formData = new FormData()
  formData.append('file', file)

  let token = null
  if (typeof window !== 'undefined') {
    token = window.localStorage.getItem('_token')

    if (!token) {
      try {
        const persistedStore = JSON.parse(
          window.localStorage.getItem('user-storage') || '{}'
        )
        token = persistedStore?.state?.user?.token || null
      } catch (_error) {
        token = null
      }
    }
  }

  if (!token) throw new Error('Authentication is required for uploads.')

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  console.log(response, 'response from s3 upload')

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error?.message || 's3 upload failed.')
  }

  const result = await response.json()
  return result.url
}
