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
const canvas = ref(null);

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

  const context = canvas.value.getContext('2d');
  
  // Clear previous drawings
  context.clearRect(0, 0, canvas.value.width, canvas.value.height);

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
}

</script>

<style scoped>
.video-stream {
  position: relative;
}

canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
