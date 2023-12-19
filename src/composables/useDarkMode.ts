import { debounce } from '@/utils/debounce';
import { ref, onMounted, Ref } from 'vue';

// Interface for the composable return type
interface DarkModeComposable {
  isDarkMode: Ref<boolean>;
  enableDarkMode: () => void;
  disableDarkMode: () => void;
}

// Main function to create the useDarkMode composable
export const useDarkMode = (): DarkModeComposable => {
  // Reactive variable to track dark mode state
  const isDarkMode = ref(false);

  // Function to check and update dark mode state
  const checkDarkMode = () => {
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Enable or disable dark mode based on the result
    if (isDarkMode.value) {
      enableDarkMode();
    } else {
      disableDarkMode();
    }
  };

  // Function to enable dark mode by adding the 'dark' class to the body
  const enableDarkMode = () => {
    if (!document.body.classList.contains('dark')) {
      document.body.classList.add('dark');
    }
  };

  // Function to disable dark mode by removing the 'dark' class from the body
  const disableDarkMode = () => {
    if (document.body.classList.contains('dark')) {
      document.body.classList.remove('dark');
    }
  };

  // Run the initial check on component mount
  onMounted(() => {
    checkDarkMode();

    // Listen for changes in the prefers-color-scheme media query
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const debouncedCheckDarkMode = debounce(checkDarkMode, 100);

    darkModeMediaQuery.addEventListener('change', debouncedCheckDarkMode);
  });

  // Return the composable's public API
  return {
    isDarkMode,
    enableDarkMode,
    disableDarkMode,
  };
};
