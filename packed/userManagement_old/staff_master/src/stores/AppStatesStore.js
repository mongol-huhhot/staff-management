import { defineStore, } from "pinia";
import { ref, } from 'vue'
/**
 * @file AppStatesStore.js
 * This file defines a Pinia store for managing the mutable states of the application.
 * 
 * Author: Chen, 2025/07/01
 */
export const useStatesStore = defineStore("statesStore", () => {
    const editStates = ref( false )         // editing(not yet saving). true:editing, false:saved
    const addNewStaff = ref('false')        // user pressed [AddNewStaff] button and edited and also not yet saved.
    // showing which data currently. 'draft', 'pending', 'returned', 'approved', 'rejected', 'confirmed', 'removed' efc. depending on workflow.
    // this time just use 'draft', 'pending', 'approved' tree states
    // "approved" data can not be edited. edit data always means editing draft
    const showDataStates = ref('pending')

    const showRebateModal = ref(false)
    const showRejectDialog = ref(false)

    return {
        editStates,
        addNewStaff,
        showDataStates,
        showRebateModal,
        showRejectDialog,
    }
})
