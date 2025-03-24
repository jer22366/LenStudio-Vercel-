
import { TeacherProvider } from "./use-teachers"
import { UserProvider } from "./use-users";
import { CourseProvider } from ".//use-courses";
import { FavoriteProvider } from "./use-collection";

const AppProvider = ({ children }) => {
  return (
    <UserProvider>
      <TeacherProvider> 
        <CourseProvider>
        <FavoriteProvider>
          {children}
          </FavoriteProvider>
        </CourseProvider>
      </TeacherProvider>
    </UserProvider>
  );
};

export default AppProvider;
