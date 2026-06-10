import { defineStore } from 'pinia'
import { useBaseStore } from "@/stores/BaseStore"; 

export const useLookupTableStore = defineStore("loopupTableStore", () => {
    const baseStore = useBaseStore();
    // define fix sql tags here!
    const loadSqltag = 'load_lookup_table'
    const saveSqltag = 'save_lookup_table'

    const data = ref([]); // Store the lookup table data

    const loadLookupTable = async (params = {}) => {
        try {
            const result = await baseStore.load(loadSqltag, params);
            if (result) {
                data.value = result;
            } else {
                console.error("No data returned from the lookup table query.");
            }
        } catch (error) {
            console.error("Error loading lookup table:", error);
        }

        return data.value
    };

    const saveLookupTable = async ( params = {}) => {
        let result
        try {
            result = await baseStore.save(saveSqltag, params);
            if (result && result.code === 0) {
                console.log("Lookup table saved successfully.");
            } else {
                console.error("Failed to save lookup table:", result.message || "Unknown error");
            }
        } catch (error) {
            console.error("Error saving lookup table:", error);
        }

        return result; // Return the updated data
    };

    return {
        data,
        loadLookupTable,
        saveLookupTable,
    }
})
