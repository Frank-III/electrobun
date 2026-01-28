// Mock file upload hook for desktop app
import { createSignal } from "solid-js"

export interface UploadedImage {
  id: string
  filename: string
  url: string
  base64Data?: string
  mediaType?: string
  isLoading: boolean
}

export interface UploadedFile {
  id: string
  filename: string
  url: string
  size?: number
  type?: string
  isLoading: boolean
}

export function useAgentsFileUpload() {
  const [isUploading, setIsUploading] = createSignal(false)
  const [uploadedFiles, setUploadedFiles] = createSignal<File[]>([])

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    // Mock upload
    setUploadedFiles(prev => [...prev, file])
    setIsUploading(false)
    return { url: URL.createObjectURL(file), filename: file.name }
  }

  const clearFiles = () => setUploadedFiles([])

  return {
    isUploading,
    uploadedFiles,
    uploadFile,
    clearFiles,
  }
}
