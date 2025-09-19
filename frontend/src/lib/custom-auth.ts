// Custom Authentication System
// This replaces Supabase's built-in auth with our custom users table

import { supabase } from './supabase'

export interface User {
  id: string
  email: string
  username: string
  program: string
  current_term: string
  interests: string[]
  goal_tags: string[]
  additional_comments: string
  gpa: number | null
  constraints: any
  completed_courses: string[]
  planned_courses: string[]
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  success: boolean
  user?: User
  error?: string
}

// Register a new user (debug version)
export async function registerUser(
  email: string, 
  password: string, 
  username?: string
): Promise<AuthResponse> {
  try {
    console.log('🚀 Starting registration for:', email)
    
    // Test basic Supabase connection first
    console.log('🔍 Testing Supabase connection...')
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.error('❌ Supabase connection failed:', testError)
      return { success: false, error: `Database connection failed: ${testError.message}` }
    }
    
    console.log('✅ Supabase connection successful')
    
    // Generate a new UUID for the user
    const userId = crypto.randomUUID()
    console.log('🆔 Generated user ID:', userId)
    
    // Simple password hash (for demo purposes)
    const hashedPassword = btoa(password)
    console.log('🔐 Password hashed')
    
    // Check if email already exists
    console.log('🔍 Checking if email exists...')
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('email', email)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('❌ Error checking existing profile:', checkError)
      return { success: false, error: `Database error during email check: ${checkError.message}` }
    }

    if (existingProfile) {
      console.log('⚠️ Email already exists')
      return { success: false, error: 'Email already exists' }
    }

    console.log('✅ Email is available')
    console.log('🔍 Creating profile...')
    
    // Create profile with minimal data first
    const profileData = {
      user_id: userId,
      username: username || email.split('@')[0],
      email: email,
      password_hash: hashedPassword,
      program: '',
      current_term: '',
      interests: [],
      goal_tags: [],
      additional_comments: '',
      gpa: null,
      constraints: {
        max_workload: 4,
        morning_labs: false,
        schedule_preferences: []
      },
      completed_courses: [],
      planned_courses: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    console.log('📝 Profile data prepared:', profileData)
    
    const { data: insertedProfile, error: profileError } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single()

    console.log('🔍 Insert result:', { insertedProfile, profileError })

    if (profileError) {
      console.error('❌ Profile creation error:', profileError)
      console.error('❌ Error details:', JSON.stringify(profileError, null, 2))
      console.error('❌ Error code:', profileError.code)
      console.error('❌ Error hint:', profileError.hint)
      console.error('❌ Error details field:', profileError.details)
      return { success: false, error: `Profile creation failed: ${profileError.message}` }
    }

    const user: User = {
      id: insertedProfile.user_id,
      email: email,
      username: insertedProfile.username || '',
      program: '',
      current_term: '',
      interests: [],
      goal_tags: [],
      additional_comments: insertedProfile.additional_comments || '',
      gpa: null,
      constraints: {
        max_workload: 4,
        morning_labs: false,
        schedule_preferences: []
      },
      completed_courses: [],
      planned_courses: [],
      created_at: insertedProfile.created_at,
      updated_at: insertedProfile.updated_at
    }

    console.log('✅ User created successfully:', user.username)
    return { success: true, user }
  } catch (error: any) {
    console.error('❌ Registration failed with exception:', error)
    console.error('❌ Error stack:', error.stack)
    return { success: false, error: `Registration failed: ${error.message}` }
  }
}

// Authenticate a user (using profiles table with email and password)
export async function authenticateUser(
  email: string, 
  password: string
): Promise<AuthResponse> {
  try {
    console.log('🔐 Authenticating user:', email)
    
    // Hash the password for comparison
    const hashedPassword = btoa(password)
    
        // Query the profiles table by email
        console.log('🔍 Searching for user with email:', email)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email)
          .single()

        console.log('🔍 Profile search result:', { profileData, profileError })

        if (profileError || !profileData) {
          console.error('❌ Authentication error:', profileError)
          console.error('❌ Profile not found for email:', email)
          return { success: false, error: 'Invalid email or password' }
        }

        // Verify password
        console.log('🔐 Verifying password...')
        console.log('🔐 Stored hash:', profileData.password_hash)
        console.log('🔐 Computed hash:', hashedPassword)
        console.log('🔐 Passwords match:', profileData.password_hash === hashedPassword)
        
        if (profileData.password_hash !== hashedPassword) {
          console.error('❌ Password verification failed')
          return { success: false, error: 'Invalid email or password' }
        }

    const user: User = {
      id: profileData.user_id,
      email: profileData.email,
      username: profileData.username || '',
      program: profileData.program || '',
      current_term: profileData.current_term || '',
      interests: profileData.interests || [],
      goal_tags: profileData.goal_tags || [],
      additional_comments: profileData.additional_comments || '',
      gpa: profileData.gpa,
      constraints: profileData.constraints || {
        max_workload: 4,
        morning_labs: false,
        schedule_preferences: []
      },
      completed_courses: profileData.completed_courses || [],
      planned_courses: profileData.planned_courses || [],
      created_at: profileData.created_at,
      updated_at: profileData.updated_at
    }

    console.log('✅ User authenticated successfully:', user.username)
    return { success: true, user }
  } catch (error: any) {
    console.error('❌ Authentication failed:', error)
    return { success: false, error: error.message }
  }
}

// Get user profile by ID
export async function getUserProfile(userId: string): Promise<AuthResponse> {
  try {
    console.log('👤 Getting user profile:', userId)
    
    const { data, error } = await supabase.rpc('get_user_profile', {
      user_uuid: userId
    })

    if (error) {
      console.error('❌ Profile fetch error:', error)
      return { success: false, error: error.message }
    }

    if (!data || data.length === 0) {
      return { success: false, error: 'User profile not found' }
    }

    const user = data[0] as User
    console.log('✅ Profile loaded successfully:', user.username)
    
    return { success: true, user }
  } catch (error: any) {
    console.error('❌ Profile fetch failed:', error)
    return { success: false, error: error.message }
  }
}

// Update user profile
export async function updateUserProfile(
  userId: string, 
  profileData: Partial<User>
): Promise<AuthResponse> {
  try {
    console.log('📝 Updating user profile:', userId)
    
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('❌ Profile update error:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Profile updated successfully')
    
    // Get the full updated profile
    return await getUserProfile(userId)
  } catch (error: any) {
    console.error('❌ Profile update failed:', error)
    return { success: false, error: error.message }
  }
}

// Create user profile (for new users)
export async function createUserProfile(
  userId: string, 
  profileData: Partial<User>
): Promise<AuthResponse> {
  try {
    console.log('📝 Creating user profile:', userId)
    
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        ...profileData
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Profile creation error:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Profile created successfully')
    
    // Get the full profile
    return await getUserProfile(userId)
  } catch (error: any) {
    console.error('❌ Profile creation failed:', error)
    return { success: false, error: error.message }
  }
}
