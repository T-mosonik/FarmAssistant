-- Create tables for farm data tracking

-- Pest and disease tracking records
CREATE TABLE IF NOT EXISTS pest_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  location TEXT NOT NULL,
  affected_plants TEXT NOT NULL,
  treatment_plan TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Farm inputs (seeds, fertilizers, etc)
CREATE TABLE IF NOT EXISTS farm_inputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  cost NUMERIC,
  purchase_date TIMESTAMP WITH TIME ZONE,
  supplier TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Farm outputs (harvests, products)
CREATE TABLE IF NOT EXISTS farm_outputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  revenue NUMERIC,
  harvest_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Farm tasks
CREATE TABLE IF NOT EXISTS farm_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  category TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE pest_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for pest_records
CREATE POLICY "Users can view their own pest records"
  ON pest_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pest records"
  ON pest_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pest records"
  ON pest_records FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pest records"
  ON pest_records FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for farm_inputs
CREATE POLICY "Users can view their own farm inputs"
  ON farm_inputs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own farm inputs"
  ON farm_inputs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own farm inputs"
  ON farm_inputs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own farm inputs"
  ON farm_inputs FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for farm_outputs
CREATE POLICY "Users can view their own farm outputs"
  ON farm_outputs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own farm outputs"
  ON farm_outputs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own farm outputs"
  ON farm_outputs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own farm outputs"
  ON farm_outputs FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for farm_tasks
CREATE POLICY "Users can view their own farm tasks"
  ON farm_tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own farm tasks"
  ON farm_tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own farm tasks"
  ON farm_tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own farm tasks"
  ON farm_tasks FOR DELETE
  USING (auth.uid() = user_id);

-- Add to realtime publication
alter publication supabase_realtime add table pest_records;
alter publication supabase_realtime add table farm_inputs;
alter publication supabase_realtime add table farm_outputs;
alter publication supabase_realtime add table farm_tasks;
