import { axiosInstance } from './axiosInstance'

export const aiApi = {
  suggestCaption: (file) => {
    const formData = new FormData()
    formData.append('media', file)
    return axiosInstance
      .post('/ai/caption-suggestion', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        meta: { skipErrorToast: true },
      })
      .then((r) => r.data)
  },
}
