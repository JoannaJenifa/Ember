import { useState, useMemo } from 'react'
import type { CreateProductInput, CategoryId, ProductWithSeller } from '@/lib/types/product'
import type { Locale } from '@/lib/i18n'
import { useCreateProduct, useUpdateProduct } from '@/lib/web3/product-registry'
import { getDemoProduct } from '@/lib/demo/templates'

export interface ProductFormResult {
  txHash: string
  product: ProductWithSeller
}

interface UseProductFormOptions {
  product?: ProductWithSeller | null
  sellerId: string
  locale?: Locale
  onSuccess?: (result: ProductFormResult) => void
  onError?: (error: Error) => void
}

// Get random demo data for product form
function getRandomDemoData(locale: Locale): CreateProductInput {
  const template = getDemoProduct(locale)
  const templateOther = getDemoProduct(locale === 'en' ? 'ko' : 'en')
  return {
    title: locale === 'en' ? template.title : templateOther.title,
    titleKo: locale === 'ko' ? template.title : templateOther.title,
    description: locale === 'en' ? template.description : templateOther.description,
    descriptionKo: locale === 'ko' ? template.description : templateOther.description,
    images: [],
    priceVery: template.priceVery,
    inventory: parseInt(template.inventory),
    category: template.category as CategoryId,
  }
}

export function useProductForm({ product, sellerId, locale = 'en', onSuccess, onError }: UseProductFormOptions) {
  // useMemo with empty deps to only generate random data once on mount
  const initialFormData = useMemo(() => getRandomDemoData(locale), [])
  const [formData, setFormData] = useState<CreateProductInput>(
    product
      ? {
          title: product.title,
          titleKo: '', // Not stored separately in subgraph
          description: product.description || '',
          descriptionKo: product.descriptionKo || '',
          images: product.images || [],
          priceVery: String(product.priceVery),
          inventory: Number(product.inventory) || 0,
          category: (product.category as CategoryId) || 'fashion',
        }
      : initialFormData
  )
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // On-chain hooks
  const { createProduct, loading: createOnchainLoading, confirming, error: createOnchainError } = useCreateProduct()
  const { updateProduct, loading: updateOnchainLoading, error: updateOnchainError } = useUpdateProduct()

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    const priceNum = parseFloat(formData.priceVery)

    if (!formData.title.trim()) {
      newErrors.title = 'Please enter a product name'
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      newErrors.priceVery = 'Please enter a valid price'
    }
    if (formData.images.length === 0) {
      newErrors.images = 'At least 1 image is required'
    }
    if (formData.inventory < 0) {
      newErrors.inventory = 'Stock must be 0 or more'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const updateField = <K extends keyof CreateProductInput>(field: K, value: CreateProductInput[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const submit = async (): Promise<boolean> => {
    if (!validate()) return false

    setLoading(true)
    try {
      const priceNum = parseFloat(formData.priceVery)

      // Create metadata URI for on-chain storage
      const metadataURI = JSON.stringify({
        titleKo: formData.titleKo,
        description: formData.description,
        descriptionKo: formData.descriptionKo,
        images: formData.images,
      })

      if (product) {
        // Update existing product on-chain
        const onchainResult = await updateProduct(BigInt(product.id), metadataURI)
        if (!onchainResult) {
          throw new Error(updateOnchainError || 'On-chain product update failed')
        }
        // For updates, just signal success
        onSuccess?.({
          txHash: onchainResult.txHash,
          product: {} as ProductWithSeller
        })
      } else {
        // Create new product on-chain - subgraph will index it
        const onchainResult = await createProduct({
          title: formData.title,
          category: formData.category,
          priceVery: priceNum,
          inventory: formData.inventory,
          metadataURI,
        })

        if (!onchainResult) {
          throw new Error(createOnchainError || 'On-chain product creation failed')
        }

        // Create optimistic product for immediate display
        const optimisticProduct: ProductWithSeller = {
          id: `pending-${Date.now()}`,
          seller: { id: sellerId, wallet: '', shopName: '' },
          title: formData.title,
          category: formData.category,
          priceVery: priceNum.toString(),
          inventory: formData.inventory.toString(),
          metadataURI,
          isActive: true,
          createdAt: Math.floor(Date.now() / 1000).toString(),
          totalSold: '0',
          description: formData.description,
          descriptionKo: formData.descriptionKo,
          images: formData.images,
        }

        onSuccess?.({
          txHash: onchainResult.txHash,
          product: optimisticProduct
        })
      }

      return true
    } catch (error) {
      console.error('Product form error:', error)
      onError?.(error instanceof Error ? error : new Error('Unknown error'))
      return false
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setFormData(initialFormData)
    setErrors({})
  }

  return {
    formData,
    loading,
    onchainLoading: createOnchainLoading || updateOnchainLoading,
    confirming,
    errors,
    updateField,
    submit,
    reset,
    isEditing: !!product,
  }
}
