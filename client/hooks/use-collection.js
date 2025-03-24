import { createContext, useContext, useState } from "react";

const FavoriteContext = createContext();


export function FavoriteProvider({ children }) {
  const [favoriteCourses, setFavoriteCourses] = useState({});

  const toggleFavorite = (courseId, isFavorite) => {
    setFavoriteCourses((prev) => ({
      ...prev,
      [courseId]: isFavorite, 
    }));
  };

  return (
    <FavoriteContext.Provider value={{ favoriteCourses, toggleFavorite }}>
      {children}
    </FavoriteContext.Provider>
  );
}

export function useFavorite() {
  return useContext(FavoriteContext);
}
