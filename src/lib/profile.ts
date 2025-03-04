import { supabase } from "./supabase";

export interface FarmProfile {
  farmName: string;
  farmType: string;
  farmSize: string;
  sizeUnit: string;
  location: string;
  description?: string;
}

// Get user profile
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// Update farm details in profile
export const updateFarmDetails = async (
  userId: string,
  farmDetails: FarmProfile,
) => {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      farm_name: farmDetails.farmName,
      farm_type: farmDetails.farmType,
      farm_size: farmDetails.farmSize,
      size_unit: farmDetails.sizeUnit,
      location: farmDetails.location,
      description: farmDetails.description,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
