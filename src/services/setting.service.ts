import axios from "../lib/axios";

export const getSettings = () => axios.get("/settings");
export const getTrashStats = () => axios.get("/settings/trash");
export const emptyRejectedTrash = () =>
  axios.delete("/settings/trash/rejected");
export const updateSetting = (key: string, value: string) =>
  axios.put("/settings", { key, value });
