export const isLoggedIn = () => {
    return !!localStorage.getItem("access_token") || !!sessionStorage.getItem("access_token");
  };
  