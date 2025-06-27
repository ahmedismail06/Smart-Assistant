import axios from "axios";

export const sendMessage = async (message, history = []) => {
  const res = await axios.post("/api/chat", { message, history });
  return res.data;
};

export const uploadFile = async (file, question = 'Summarize this document', type = "document") => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);
  formData.append("query", question);
  const res = await axios.post("/api/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const uploadSchedule = async (file, query, title) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("query", query);
  formData.append("title", title);
  const res = await axios.post("/api/schedule", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}; 