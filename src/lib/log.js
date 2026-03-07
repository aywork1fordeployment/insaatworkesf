import { supabase } from './supabase'

export const writeLog = async (order_id, action, note) => {
  await supabase.from('order_logs').insert({ order_id, action, note })
}