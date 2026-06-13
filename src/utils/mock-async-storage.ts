// Mock implementation of AsyncStorage for Web/Capacitor
const AsyncStorage = {
    getItem: async (key: string) => {
      return localStorage.getItem(key);
    },
    setItem: async (key: string, value: string) => {
      localStorage.setItem(key, value);
    },
    removeItem: async (key: string) => {
      localStorage.removeItem(key);
    },
    clear: async () => {
      localStorage.clear();
    },
    getAllKeys: async () => {
      return Object.keys(localStorage);
    },
    multiGet: async (keys: string[]) => {
      return keys.map(key => [key, localStorage.getItem(key)]);
    },
    multiSet: async (keyValuePairs: string[][]) => {
      keyValuePairs.forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
    },
    multiRemove: async (keys: string[]) => {
      keys.forEach(key => {
        localStorage.removeItem(key);
      });
    },
  };
  
  export default AsyncStorage;
