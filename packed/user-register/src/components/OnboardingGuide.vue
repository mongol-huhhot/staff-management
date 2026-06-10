<script setup>
import { ref, onMounted, nextTick, watch, computed, inject } from "vue";

const props = defineProps({
  steps: Array,       // The raw steps array from the parent component
  formData: Object,   // Holds input values for validation
});

/** a sample configuration for above "steps" */
// const steps = ref([
//     { 
//         id: "staff_code_selector", 
//         message: "選択か入力、複数入力可能、複数の場合社員情報表示なし!" ,
//         priority: 1,
//     },
//     { 
//         id: "template_selector", 
//         message: "契約テンプレート選択、デフォルトデータは自動記入されます!",
//         priority: 2,
//     },
//     { 
//         id: "staff_base_info_area", 
//         message: "社員基本情報を確認して入力します!" ,
//         priority: 3,
//         validate: (formData) => showSwitch.value,
//     },
//     { 
//         id: "contract_version_area", 
//         message: "契約バージョン、ステータス、有効など情報を入力します!",
//         priority: 3,
//     },
//     { 
//         id: "contract_start_expire_date_area", 
//         message: "契約期間、更新など情報を入力します!",
//         priority: 4,
//     },
//     { 
//         id: "contract_work_place_area", 
//         message: "就業場所などを入力します!",
//     },
//     { 
//         id: "contract_work_time_area", 
//         message: "就業時間などを入力します!",
//     },
//     { 
//         id: "contract_holidays_area", 
//         message: "休日を選択します。複数可能です!" 
//     },
//     { 
//         id: "contract_vacation_area", 
//         message: "休暇を入力します!" 
//     },
//     { 
//         id: "salary_area", 
//         message: "賃金関連項目を入力します!" 
//     },
//     { 
//         id: "pay_relative_area", 
//         message: "支払関連項目を入力します!" 
//     },
//     { 
//         id: "insurance_relative_area", 
//         message: "保険関連項目を入力します!" 
//     },
//     { 
//         id: "note_area", 
//         message: "必要な説明文など文章で入力します!" 
//     },
// ]);

const INJECT_KEY = "showGuide";

// Inject the reactive guideVisible flag from the parent
const guideVisible = inject(INJECT_KEY, ref(true));

const emit = defineEmits(["close"]);
const currentStep = ref(0);

/**
 * Compute steps dynamically based on validation rules.
 * Only steps that pass the validation are included,
 * and then sorted by the given priority.
 */
const orderedSteps = computed(() => {
  return props.steps
    .filter((step) => {
      if (!step.validate) return true; // No validation function, always include
      return step.validate(props.formData); // Run validation function
    })
    .sort((a, b) => (a.priority || 100) - (b.priority || 100));
});

/**
 * Helper function to remove any highlighted elements.
 */
const clearHighlights = () => {
  document.querySelectorAll(".highlight").forEach((el) => {
    el.classList.remove("highlight");
  });
};

/**
 * Function to highlight the element corresponding to the current step.
 * It skips steps whose validation fails.
 */
const highlightElement = async () => {
  // Clear any existing highlights
  clearHighlights();

  await nextTick();
  let step = orderedSteps.value[currentStep.value];

  // Skip steps if validation fails
  while (step && step.validate && !step.validate(props.formData)) {
    currentStep.value++;
    step = orderedSteps.value[currentStep.value];
  }

  if (!step) return;

  const el = document.getElementById(step.id);
  if (el) {
    el.classList.add("highlight");
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }
};

/**
 * Move to the next step.
 */
const nextStep = () => {
  if (currentStep.value < orderedSteps.value.length - 1) {
    currentStep.value++;
    highlightElement();
  } else {
    guideVisible.value = false;
    clearHighlights();
    emit("close");
  }
};

/**
 * Move to the previous step.
 */
const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
    highlightElement();
  }
};

/**
 * Skip the guide completely.
 */
const skipGuide = () => {
  guideVisible.value = false;
  clearHighlights();
  emit("close");
};

/**
 * Watch the injected guideVisible flag.
 * When it becomes true, start the guide;
 * when false, clear highlights.
 */
watch(
  () => guideVisible.value,
  (newVal) => {
    if (newVal) {
      currentStep.value = 0;
      highlightElement();
    } else {
      clearHighlights();
    }
  }
);

/**
 * On mount, if the guide is visible, highlight the first step.
 */
onMounted(() => {
  if (guideVisible.value) {
    highlightElement();
  }
});
</script>

<template>
  <!-- The guide is shown only when guideVisible is true -->
  <v-container v-if="guideVisible">
    <v-card class="speech-bubble">
      <v-card-text v-if="orderedSteps[currentStep]">
        {{ orderedSteps[currentStep].message }}
        <!-- <div v-html="orderedSteps[currentStep].message" 
          style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; word-wrap: break-word;"/> -->
      </v-card-text>
      <v-card-actions>
        <v-btn color="warning" @click="previousStep" :disabled="currentStep === 0">
          前へ
        </v-btn>
        <v-btn color="primary" @click="nextStep">
          次へ
        </v-btn>
        <v-btn color="error" @click="skipGuide">
          スキップ
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<style scoped>
/* Speech bubble styling */
.speech-bubble {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border-radius: 10px;
  padding: 10px;
  z-index: 10000;
  
  /* Allow long text to wrap onto multiple lines */
  white-space: normal;
  word-wrap: break-word;
  
  /* For narrow screens, allow the card to take up most of the viewport width */
  max-width: 90vw;
  width: auto;
}

/* For wider screens, set a fixed max-width */
@media (min-width: 600px) {
  .speech-bubble {
    max-width: 600px;
  }
}

/* Example style for highlighted elements */
.highlight {
  border: 3px solid red;
  box-shadow: 0 0 10px red;
  transition: 0.3s;
}
</style>
