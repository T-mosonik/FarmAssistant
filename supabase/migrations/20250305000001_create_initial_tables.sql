-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  farm_name TEXT,
  farm_type TEXT,
  farm_size TEXT,
  size_unit TEXT,
  location TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for profiles
DROP POLICY IF EXISTS "Users can view and update their own profile" ON profiles;
CREATE POLICY "Users can view and update their own profile"
  ON profiles
  USING (auth.uid() = id);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT CHECK (status IN ('pending', 'in-progress', 'completed', 'overdue')),
  assigned_to TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policy for tasks
DROP POLICY IF EXISTS "Users can CRUD their own tasks" ON tasks;
CREATE POLICY "Users can CRUD their own tasks"
  ON tasks
  USING (auth.uid() = user_id);

-- Enable realtime
alter publication supabase_realtime add table profiles;
alter publication supabase_realtime add table tasks;
