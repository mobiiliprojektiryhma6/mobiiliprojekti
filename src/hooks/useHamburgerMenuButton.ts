import { useCallback, useState } from "react";
import type { MenuRoute } from "../../types/HamburgerMenuButtonTypes";

type UseHamburgerMenuButtonParams = {
    onNavigate: (screenName: MenuRoute) => void;
};

export const useHamburgerMenuButton = ({ onNavigate }: UseHamburgerMenuButtonParams) => {
    const [isVisible, setIsVisible] = useState(false);

    const toggleMenu = useCallback(() => {
        setIsVisible((currentValue) => !currentValue);
    }, []);

    const navigateToScreen = useCallback(
        (screenName: MenuRoute) => {
            onNavigate(screenName);
            setIsVisible(false);
        },
        [onNavigate],
    );

    return {
        isVisible,
        navigateToScreen,
        toggleMenu,
    };
};
