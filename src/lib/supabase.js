import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://xkiprgxnqlyanmttsdfj.supabase.co"
const supabaseAnonKey = "sb_publishable_ndhOHElPvs4NmuL7WHWHfg__ON64Glr"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)