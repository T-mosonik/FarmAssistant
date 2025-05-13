import { supabase } from "./supabase";

// Types
export interface PestRecord {
  id?: string;
  user_id?: string;
  name: string;
  date: string | Date;
  location: string;
  affected_plants: string;
  treatment_plan: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FarmInput {
  id?: string;
  user_id?: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  cost?: number;
  purchase_date?: string | Date;
  supplier?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FarmOutput {
  id?: string;
  user_id?: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  revenue?: number;
  harvest_date?: string | Date;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FarmTask {
  id?: string;
  user_id?: string;
  title: string;
  description?: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  due_date?: string | Date;
  completed_at?: string | Date;
  category?: string;
  location?: string;
  created_at?: string;
  updated_at?: string;
}

// Pest Records
export const getPestRecords = async () => {
  const { data, error } = await supabase
    .from("pest_records")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching pest records:", error);
    throw error;
  }

  return data;
};

export const createPestRecord = async (record: PestRecord) => {
  // Format date if it's a string in a non-ISO format
  let formattedRecord = { ...record };
  if (typeof record.date === "string") {
    try {
      // Handle dates like "May 12th 2025"
      if (record.date.match(/[a-zA-Z]+\s+\d+(st|nd|rd|th)?\s+\d{4}/)) {
        // Remove ordinal suffixes (st, nd, rd, th)
        const cleanDate = record.date.replace(/(\d+)(st|nd|rd|th)/, "$1");
        const parsedDate = new Date(cleanDate);
        if (!isNaN(parsedDate.getTime())) {
          formattedRecord.date = parsedDate.toISOString();
        }
      }
      // Handle other date formats
      else if (!record.date.includes("T")) {
        const parsedDate = new Date(record.date);
        if (!isNaN(parsedDate.getTime())) {
          formattedRecord.date = parsedDate.toISOString();
        }
      }
    } catch (e) {
      console.error("Error parsing date:", e);
      // If parsing fails, set to current date as fallback
      formattedRecord.date = new Date().toISOString();
    }
  }

  const { data, error } = await supabase
    .from("pest_records")
    .insert([formattedRecord])
    .select();

  if (error) {
    console.error("Error creating pest record:", error);
    throw error;
  }

  return data[0];
};

export const updatePestRecord = async (
  id: string,
  updates: Partial<PestRecord>,
) => {
  const { data, error } = await supabase
    .from("pest_records")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select();

  if (error) {
    console.error("Error updating pest record:", error);
    throw error;
  }

  return data[0];
};

export const deletePestRecord = async (id: string) => {
  const { error } = await supabase.from("pest_records").delete().eq("id", id);

  if (error) {
    console.error("Error deleting pest record:", error);
    throw error;
  }

  return true;
};

// Farm Inputs
export const getFarmInputs = async () => {
  const { data, error } = await supabase
    .from("farm_inputs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching farm inputs:", error);
    throw error;
  }

  return data;
};

export const createFarmInput = async (input: FarmInput) => {
  const { data, error } = await supabase
    .from("farm_inputs")
    .insert([input])
    .select();

  if (error) {
    console.error("Error creating farm input:", error);
    throw error;
  }

  return data[0];
};

export const updateFarmInput = async (
  id: string,
  updates: Partial<FarmInput>,
) => {
  const { data, error } = await supabase
    .from("farm_inputs")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select();

  if (error) {
    console.error("Error updating farm input:", error);
    throw error;
  }

  return data[0];
};

export const deleteFarmInput = async (id: string) => {
  const { error } = await supabase.from("farm_inputs").delete().eq("id", id);

  if (error) {
    console.error("Error deleting farm input:", error);
    throw error;
  }

  return true;
};

// Farm Outputs
export const getFarmOutputs = async () => {
  const { data, error } = await supabase
    .from("farm_outputs")
    .select("*")
    .order("harvest_date", { ascending: false });

  if (error) {
    console.error("Error fetching farm outputs:", error);
    throw error;
  }

  return data;
};

export const createFarmOutput = async (output: FarmOutput) => {
  const { data, error } = await supabase
    .from("farm_outputs")
    .insert([output])
    .select();

  if (error) {
    console.error("Error creating farm output:", error);
    throw error;
  }

  return data[0];
};

export const updateFarmOutput = async (
  id: string,
  updates: Partial<FarmOutput>,
) => {
  const { data, error } = await supabase
    .from("farm_outputs")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select();

  if (error) {
    console.error("Error updating farm output:", error);
    throw error;
  }

  return data[0];
};

export const deleteFarmOutput = async (id: string) => {
  const { error } = await supabase.from("farm_outputs").delete().eq("id", id);

  if (error) {
    console.error("Error deleting farm output:", error);
    throw error;
  }

  return true;
};

// Farm Tasks
export const getFarmTasks = async () => {
  const { data, error } = await supabase
    .from("farm_tasks")
    .select("*")
    .order("due_date", { ascending: true });

  if (error) {
    console.error("Error fetching farm tasks:", error);
    throw error;
  }

  return data;
};

export const createFarmTask = async (task: FarmTask) => {
  const { data, error } = await supabase
    .from("farm_tasks")
    .insert([task])
    .select();

  if (error) {
    console.error("Error creating farm task:", error);
    throw error;
  }

  return data[0];
};

export const updateFarmTask = async (
  id: string,
  updates: Partial<FarmTask>,
) => {
  const { data, error } = await supabase
    .from("farm_tasks")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select();

  if (error) {
    console.error("Error updating farm task:", error);
    throw error;
  }

  return data[0];
};

export const deleteFarmTask = async (id: string) => {
  const { error } = await supabase.from("farm_tasks").delete().eq("id", id);

  if (error) {
    console.error("Error deleting farm task:", error);
    throw error;
  }

  return true;
};

export const completeFarmTask = async (id: string) => {
  const { data, error } = await supabase
    .from("farm_tasks")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select();

  if (error) {
    console.error("Error completing farm task:", error);
    throw error;
  }

  return data[0];
};
