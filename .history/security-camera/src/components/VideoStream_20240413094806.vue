<template>
  <v-card class="video-stream" elevation="2">
    <v-card-title>Video Stream</v-card-title>
    <v-card-text>
      <v-container>
        <v-row justify="center">
          <v-col cols="12">
            <video ref="video" autoplay muted style="width: 300px; height: 300px;"></video>
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
let model = null;
const predictions = ref([]);

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
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  // Set canvas dimensions to match video stream
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;

  // Clear previous drawings
  context.clearRect(0, 0, canvas.width, canvas.height);

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

  // Draw the canvas on top of the video stream
  const videoParent = videoElement.parentElement;
  videoParent.insertBefore(canvas, videoElement);

  // Call the function again on the next animation frame
  requestAnimationFrame(predictObjects);
}
</script>
