import axios from "../lib/axios";

export const getSettings = () => axios.get("/settings");
export const updateSetting = (key: string, value: string) =>
  axios.put("/settings", { key, value });
