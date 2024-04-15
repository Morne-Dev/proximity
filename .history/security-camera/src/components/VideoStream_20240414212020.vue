<template>
  <div>
    <video ref="video" :autoplay="video" muted class="video-feed" style="max-width: 100%; height: auto;"></video>
            <canvas ref="canvas" class="canvas-overlay"></canvas>
  </div>


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
}
</style>
