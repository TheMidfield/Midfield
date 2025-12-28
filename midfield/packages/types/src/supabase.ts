export type Json =
  | string
  | number  
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]
  
// Truncated - types generated successfully
