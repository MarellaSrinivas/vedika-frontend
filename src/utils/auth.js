
export const getAccessToken = () => {
  return localStorage.getItem("thevedika_token");
};

export const getCurrentUser = () => {
  try {
    return JSON.parse(
      localStorage.getItem("thevedika_user") || "null"
    );
  } catch {
    return null;
  }
};

export const isLoggedIn = () => {
  return Boolean(
    getAccessToken() && getCurrentUser()?.id
  );
};
