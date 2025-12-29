import { supabase, LabangReview, LabangReviewInsert, LabangReviewUpdate } from '@/lib/db/supabase'

export const labangReviewService = {
  async getAll(options?: { limit?: number; offset?: number; productId?: string }) {
    let query = supabase
      .from('labang_reviews')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (options?.productId) {
      query = query.eq('product_id', options.productId)
    }
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit ?? 10) - 1)
    }

    const { data, error, count } = await query
    if (error) throw error
    return { data: data as LabangReview[], count }
  },

  async getById(id: string): Promise<LabangReview | null> {
    const { data, error } = await supabase
      .from('labang_reviews')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async getByProduct(productId: string): Promise<LabangReview[]> {
    const { data, error } = await supabase
      .from('labang_reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getByBuyer(buyerAddress: string): Promise<LabangReview[]> {
    const { data, error } = await supabase
      .from('labang_reviews')
      .select('*')
      .eq('buyer_address', buyerAddress)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async create(review: LabangReviewInsert): Promise<LabangReview> {
    const { data, error } = await supabase
      .from('labang_reviews')
      .insert(review)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: LabangReviewUpdate): Promise<LabangReview> {
    const { data, error } = await supabase
      .from('labang_reviews')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('labang_reviews')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async getProductRating(productId: string): Promise<{ average: number; count: number }> {
    const { data, error } = await supabase
      .from('labang_reviews')
      .select('rating')
      .eq('product_id', productId)

    if (error) throw error

    if (!data || data.length === 0) {
      return { average: 0, count: 0 }
    }

    const sum = data.reduce((acc, r) => acc + (r.rating ?? 0), 0)
    return { average: sum / data.length, count: data.length }
  },
}
