-- Create profiles table for user profile data
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE,
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

-- Create tasks table for farm task management
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT CHECK (status IN ('pending', 'in-progress', 'completed', 'overdue')),
  assigned_to TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory_inputs table for tracking farm inputs
CREATE TABLE IF NOT EXISTS inventory_inputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  unit TEXT,
  cost NUMERIC,
  supplier TEXT,
  purchase_date TIMESTAMP WITH TIME ZONE,
  expiry_date TIMESTAMP WITH TIME ZONE,
  status TEXT GENERATED ALWAYS AS (
    CASE 
      WHEN quantity = 0 THEN 'out-of-stock'
      WHEN quantity < 10 THEN 'low-stock'
      ELSE 'in-stock'
    END
  ) STORED,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory_outputs table for tracking farm outputs/harvests
CREATE TABLE IF NOT EXISTS inventory_outputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  unit TEXT,
  price NUMERIC,
  harvest_date TIMESTAMP WITH TIME ZONE,
  status TEXT GENERATED ALWAYS AS (
    CASE 
      WHEN quantity = 0 THEN 'out-of-stock'
      WHEN quantity < 10 THEN 'low-stock'
      ELSE 'in-stock'
    END
  ) STORED,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pest_tracking table for pest and disease identification history
CREATE TABLE IF NOT EXISTS pest_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('pest', 'disease', 'plant', 'error')),
  description TEXT,
  location TEXT,
  affected_plants TEXT[],
  confidence NUMERIC,
  image_url TEXT,
  treatment_plan TEXT,
  treatment_status TEXT CHECK (treatment_status IN ('pending', 'in-progress', 'completed')),
  identification_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pest_tracking ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create policies for tasks
CREATE POLICY "Users can view their own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for inventory_inputs
CREATE POLICY "Users can view their own inventory inputs" ON inventory_inputs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inventory inputs" ON inventory_inputs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory inputs" ON inventory_inputs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inventory inputs" ON inventory_inputs
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for inventory_outputs
CREATE POLICY "Users can view their own inventory outputs" ON inventory_outputs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inventory outputs" ON inventory_outputs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory outputs" ON inventory_outputs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inventory outputs" ON inventory_outputs
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for pest_tracking
CREATE POLICY "Users can view their own pest tracking records" ON pest_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pest tracking records" ON pest_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pest tracking records" ON pest_tracking
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pest tracking records" ON pest_tracking
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
