<template>
  <v-container class="min-h-content py-5">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <h1 class="text-center">Security Camera</h1>
        <p class="text-h4 text-center">Multiple object detection with emergency alarm</p>
        <VideoStream :camStarted="camStarted" @toggleCam="toggleCam"></VideoStream>
        <div v-if="!showBtn" class="text-center my-5">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
          <span>Loading...</span>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import VideoStream from './components/VideoStream.vue';

const camStarted = ref(false);
const showBtn = ref(false);

let model = undefined;

// loading the model
cocoSsd.load().then(function (loadedModel) {
  model = loadedModel;
  showBtn.value = true;
});

async function enableCam() {
  if (!model) {
    return;
  }
  const constraints = {
    video: true
  };

  // Activate the webcam stream.
  await navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
    const video = document.querySelector('video');
    if (video) {
      video.srcObject = stream;
    }
  });

  // Toggle camStarted
  camStarted.value = true;
}

function toggleCam() {
  if (camStarted.value) {
    // Stop the video stream
    const video = document.querySelector('video');
    if (video) {
      const stream = video.srcObject;
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    }
  } else {
    // Start the video stream
    enableCam();
  }

  // Toggle camStarted
  camStarted.value = !camStarted.value;
}
</script>
