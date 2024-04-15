<template>
  <v-card
    class="mx-auto"
    max-width="400"
  >
    <v-img height="200">
      <video ref="video" :autoplay="video" muted class="video-feed" style="width: 100%; height: 100%; object-fit: cover;"></video>
      <canvas ref="canvas" class="canvas-overlay"></canvas>
      <!-- Prediction text -->
      <div class="prediction-text">
        <v-list>
          <v-subheader>Detected Objects</v-subheader>
          <v-list-item v-for="(prediction, index) in predictions" :key="index">
            <v-list-item-content>
              <v-list-item-title>{{ prediction.class }}</v-list-item-title>
              <v-list-item-subtitle>{{ prediction.score }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </div>
    </v-img>

    <v-card-title>Top 10 Australian beaches</v-card-title>

    <v-card-subtitle class="pt-4">
      Object Detections: {{ predictions.length > 0 ? predictions[0].class : 'No prediction' }}
    </v-card-subtitle>

    <!-- Prediction statistics -->
    <v-card-text>
      <div v-if="predictions.length > 0">
        Confidence: {{ predictions[0].score }}
      </div>
    </v-card-text>

    <v-card-actions>
      <v-btn color="orange" text="Share"></v-btn>

      <v-btn color="orange" text="Explore"></v-btn>
    </v-card-actions>
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
  adjustCanvasSize(); // Call the function to adjust canvas size initially
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
        videoElement.addEventListener('loadedmetadata', adjustCanvasSize); // Listen for video metadata loaded event
        videoElement.addEventListener('resize', adjustCanvasSize); // Listen for video resize event
        videoElement.addEventListener('loadeddata', predictObjects);
      }
    })
    .catch(err => {
      console.error('Error accessing webcam:', err);
    });
}

function adjustCanvasSize() {
  const videoElement = video.value;
  const canvasElement = canvas.value;
  if (videoElement && canvasElement) {
    // Set canvas dimensions to match video stream
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
  }
}

async function predictObjects() {
  const videoElement = video.value;
  const currentPredictions = await model.detect(videoElement);
  predictions.value = currentPredictions;
  
  // Get the canvas element
  const canvasElement = canvas.value;
  const context = canvasElement.getContext('2d');

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

<style scoped>
.canvas-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.prediction-text {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 10px;
  border-radius: 5px;
}

.video-feed {
  width: 100%;
  height: 100%;
}
</style>
