export function getApiUrl(): string {
  const override = process.env.MAIN_VITE_API_URL || process.env.API_URL;
  return override || "https://21st.dev";
}
