<template>
  <v-card class="video-stream" elevation="2">
    <v-card-text>
      <v-container fluid>
        <v-row justify="center">
          <v-col cols="12" style="position: relative;">
            <video ref="video" :autoplay="video" muted class="video-feed" style="max-width: 100%; height: auto;"></video>
            <canvas ref="canvas" style=""></canvas>
          </v-col>
        </v-row>
        <v-row justify="center">
          <v-col cols="12">
            <v-list>
              <v-subheader>Detected Objects</v-subheader>
              <v-list-item v-for="(prediction, index) in predictions" :key="index">
                <v-list-item-content>
                  <v-list-item-title>{{ prediction.class }}</v-list-item-title>
                  <v-list-item-subtitle>{{ prediction.score }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

const video = ref(null);
const canvas = ref(null);
const predictions = ref([]);
let model = null;

onMounted(async () => {
  await loadModel();
  startVideoStream();
});

onBeforeUnmount(() => {
  const videoElement = video.value;
  if (videoElement) {
    videoElement.srcObject = null;
  }
});

async function loadModel() {
  model = await cocoSsd.load();
}

function startVideoStream() {
  const constraints = { video: true };
  navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
      const videoElement = video.value;
      if (videoElement) {
        videoElement.srcObject = stream;
        videoElement.addEventListener('loadeddata', predictObjects);
      }
    })
    .catch(err => {
      console.error('Error accessing webcam:', err);
    });
}

async function predictObjects() {
  const videoElement = video.value;
  const currentPredictions = await model.detect(videoElement);
  predictions.value = currentPredictions;
  
  // Get the canvas element
  const canvasElement = canvas.value;
  const context = canvasElement.getContext('2d');

  // Set canvas dimensions to match video stream
  canvasElement.width = videoElement.videoWidth;
  canvasElement.height = videoElement.videoHeight;

  // Clear previous drawings
  context.clearRect(0, 0, canvasElement.width, canvasElement.height);

  // Draw bounding boxes for each prediction
  predictions.value.forEach(prediction => {
    // Extract prediction data
    const [x, y, width, height] = prediction.bbox;
    const label = prediction.class;
    
    // Set style for the bounding box
    context.strokeStyle = '#00FFFF'; // Turquoise color
    context.lineWidth = 2;
    context.fillStyle = '#00FFFF';
    context.font = '18px Arial';

    // Draw the bounding box
    context.beginPath();
    context.rect(x, y, width, height);
    context.stroke();

    // Draw label text
    context.fillText(label, x, y - 10);
  });

  // Call the function again on the next animation frame
  requestAnimationFrame(predictObjects);
}
</script>
