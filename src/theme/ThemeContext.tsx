import React, { createContext, useContext, useState, useEffect } from "react";
import { Appearance } from "react-native";
import { lightTheme, darkTheme } from "./theme";
import { createGlobalStyles } from "../styles/globalStyles";

type ThemeMode = "light" | "dark" | "system";

const ThemeContext = createContext({
  theme: lightTheme,
  styles: createGlobalStyles(lightTheme),
  setThemeMode: (mode: ThemeMode) => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>("system");
  const [theme, setTheme] = useState(lightTheme);

  // Luo styles aina kun theme muuttuu
  const styles = createGlobalStyles(theme);

  const applyTheme = (m: ThemeMode) => {
    if (m === "light") {
      setTheme(lightTheme);
    } else if (m === "dark") {
      setTheme(darkTheme);
    } else {
      const system = Appearance.getColorScheme();
      setTheme(system === "dark" ? darkTheme : lightTheme);
    }
  };

  useEffect(() => {
    applyTheme(mode);

    if (mode === "system") {
      const listener = Appearance.addChangeListener(({ colorScheme }) => {
        setTheme(colorScheme === "dark" ? darkTheme : lightTheme);
      });

      return () => listener.remove();
    }
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ theme, styles, setThemeMode: setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
