-- Create pest_records table for pest and disease tracking
CREATE TABLE IF NOT EXISTS pest_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  location TEXT NOT NULL,
  affected_plants TEXT NOT NULL,
  treatment_plan TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE pest_records ENABLE ROW LEVEL SECURITY;

-- Create policies for pest_records
CREATE POLICY "Users can view their own pest records" ON pest_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pest records" ON pest_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pest records" ON pest_records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pest records" ON pest_records
  FOR DELETE USING (auth.uid() = user_id);

-- Enable realtime for pest_records
alter publication supabase_realtime add table pest_records;
