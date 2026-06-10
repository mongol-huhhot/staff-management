<script setup>
import { ref, computed } from "vue";
import OnboardingGuide from "@/components/OnboardingGuide.vue";

const showGuide = ref(false);
const formData = ref({
  selectedOption: null,
  fieldA: "",
  fieldB: "",
});

// Steps definition with validation functions
const steps = [
  { id: "start-btn", message: "Click here to begin!", priority: 1 },
  { id: "general-info", message: "Fill in your basic details.", priority: 2 },
  {
    id: "field-a",
    message: "Field A is required for Option A!",
    priority: 3,
    validate: (formData) => formData.selectedOption === "A", // Show only if Option A is selected
  },
  {
    id: "field-b",
    message: "Field B is required for Option B!",
    priority: 3,
    validate: (formData) => formData.selectedOption === "B", // Show only if Option B is selected
  },
  {
    id: "extra-step",
    message: "Extra Step is only shown if Field A has content.",
    priority: 4,
    validate: (formData) => !!formData.fieldA, // Show if Field A is filled
  },
  { id: "submit-btn", message: "Click submit to finish.", priority: 5 },
];

const startGuide = () => {
  showGuide.value = true;
};

const closeGuide = () => {
  showGuide.value = false;
};
</script>

<template>
  <v-container>
    <v-select
      label="Choose an option"
      :items="['A', 'B']"
      v-model="formData.selectedOption"
      class="mb-4"
    ></v-select>

    <v-btn id="start-btn" color="primary" @click="startGuide">Start Guide</v-btn>
    
    <v-card id="general-info" class="mt-5">
      <v-card-title>General Info</v-card-title>
      <v-card-text>Fill in your personal details...</v-card-text>
    </v-card>

    <v-card v-if="formData.selectedOption === 'A'" id="field-a" class="mt-5">
      <v-card-title>Field A</v-card-title>
      <v-card-text>
        Only required for Option A
        <v-text-field v-model="formData.fieldA" label="Enter Field A"></v-text-field>
      </v-card-text>
    </v-card>

    <v-card v-if="formData.selectedOption === 'B'" id="field-b" class="mt-5">
      <v-card-title>Field B</v-card-title>
      <v-card-text>
        Only required for Option B
        <v-text-field v-model="formData.fieldB" label="Enter Field B"></v-text-field>
      </v-card-text>
    </v-card>

    <v-card v-if="formData.fieldA" id="extra-step" class="mt-5">
      <v-card-title>Extra Step</v-card-title>
      <v-card-text>
        You filled Field A, so this step appears!
      </v-card-text>
    </v-card>

    <v-btn id="submit-btn" color="success" class="mt-5">Submit</v-btn>

    <!-- Onboarding Guide -->
    <OnboardingGuide
      :steps="steps"
      :showGuide="showGuide"
      :formData="formData"
      @close="closeGuide"
    />
  </v-container>
</template>

<style>
.highlight {
  position: relative;
  z-index: 9999;
  border: 3px solid red;
  box-shadow: 0px 0px 10px red;
  transition: 0.3s;
}
</style>
