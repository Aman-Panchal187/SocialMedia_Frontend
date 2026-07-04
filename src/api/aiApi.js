import { axiosInstance } from './axiosInstance'

export const aiApi = {
  suggestCaption: (file) => {
    const formData = new FormData()
    formData.append('media', file)
    // Unlike other requests, a caption-suggestion failure is worth surfacing
    // to the user via the normal error toast (unconfigured/no-op still
    // resolves successfully with { suggestion: null }, so that case never
    // reaches here) rather than being suppressed.
    return axiosInstance
      .post('/ai/caption-suggestion', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },
}
