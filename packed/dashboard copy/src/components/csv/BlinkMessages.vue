<script setup>
</script>

<template>
    <div class="blinking-colorful-content">
      <slot></slot>
    </div>
  </template>
 
  <style>
  @keyframes blinker {
    50% {
      opacity: 0;
    }
  }
  
  @keyframes colorChange {
    0% { color: red; }
    25% { color: blue; }
    50% { color: green; }
    75% { color: yellow; }
    100% { color: red; }
  }
  
  .blinking-colorful-content {
    animation: blinker 1s linear infinite, colorChange 2s linear infinite;
  }
  </style>
  