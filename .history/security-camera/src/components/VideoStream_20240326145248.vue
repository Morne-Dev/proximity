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
}
</script>
