import {
  supabase,
  LabangStream,
  LabangStreamInsert,
  LabangStreamUpdate,
  LabangStreamProduct,
  LabangStreamProductInsert,
} from '@/lib/db/supabase'

export const labangStreamService = {
  async getAll(options?: {
    limit?: number
    offset?: number
    sellerId?: string
    status?: 'scheduled' | 'live' | 'ended'
  }) {
    let query = supabase
      .from('labang_streams')
      .select('*', { count: 'exact' })
      .order('scheduled_at', { ascending: true })

    if (options?.sellerId) {
      query = query.eq('seller_id', options.sellerId)
    }
    if (options?.status) {
      query = query.eq('status', options.status)
    }
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit ?? 10) - 1)
    }

    const { data, error, count } = await query
    if (error) throw error
    return { data: data as LabangStream[], count }
  },

  async getById(id: string): Promise<LabangStream | null> {
    const { data, error } = await supabase
      .from('labang_streams')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async getLive(): Promise<LabangStream[]> {
    const { data, error } = await supabase
      .from('labang_streams')
      .select('*')
      .eq('status', 'live')
      .order('viewer_count', { ascending: false })

    if (error) throw error
    return data
  },

  async getUpcoming(limit = 10): Promise<LabangStream[]> {
    const { data, error } = await supabase
      .from('labang_streams')
      .select('*')
      .eq('status', 'scheduled')
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(limit)

    if (error) throw error
    return data
  },

  async getReplays(options?: {
    limit?: number
    category?: string
    sort?: 'popular' | 'latest'
  }): Promise<LabangStream[]> {
    let query = supabase
      .from('labang_streams')
      .select('*')
      .eq('status', 'ended')
      .not('recording_url', 'is', null)

    if (options?.sort === 'latest') {
      query = query.order('ended_at', { ascending: false })
    } else {
      query = query.order('peak_viewers', { ascending: false })
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  async create(stream: LabangStreamInsert): Promise<LabangStream> {
    const { data, error } = await supabase
      .from('labang_streams')
      .insert(stream)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: LabangStreamUpdate): Promise<LabangStream> {
    const { data, error } = await supabase
      .from('labang_streams')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async goLive(id: string): Promise<LabangStream> {
    return this.update(id, { status: 'live', started_at: new Date().toISOString() })
  },

  async endStream(id: string): Promise<LabangStream> {
    return this.update(id, { status: 'ended', ended_at: new Date().toISOString() })
  },

  async updateViewerCount(id: string, count: number): Promise<void> {
    const stream = await this.getById(id)
    const peakViewers = stream?.peak_viewers ?? 0

    const { error } = await supabase
      .from('labang_streams')
      .update({
        viewer_count: count,
        peak_viewers: Math.max(peakViewers, count),
      })
      .eq('id', id)

    if (error) throw error
  },

  // Stream Products
  async addProduct(streamProduct: LabangStreamProductInsert): Promise<LabangStreamProduct> {
    const { data, error } = await supabase
      .from('labang_stream_products')
      .insert(streamProduct)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getStreamProducts(streamId: string): Promise<LabangStreamProduct[]> {
    const { data, error } = await supabase
      .from('labang_stream_products')
      .select('*')
      .eq('stream_id', streamId)
      .order('display_order', { ascending: true })

    if (error) throw error
    return data
  },

  async removeProduct(streamId: string, productId: string): Promise<void> {
    const { error } = await supabase
      .from('labang_stream_products')
      .delete()
      .eq('stream_id', streamId)
      .eq('product_id', productId)

    if (error) throw error
  },
}
