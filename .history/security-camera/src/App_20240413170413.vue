<template>
  <v-container class="min-h-content py-5">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <h1 class="text-center">Security Camera</h1>
        <p class="text-h4 text-center">Multiple object detection with emergency alarm</p>
        <v-btn color="primary" @click="toggleCam">{{ camStarted ? 'Disable Webcam' : 'Enable Webcam' }}</v-btn>
        <video-stream v-if="camStarted" :model="model"></video-stream> <!-- Pass the model as a prop -->
        <!-- Loader overlay -->
        <v-skeleton-loader v-else :elevation="24" color="secondary" type="card"></v-skeleton-loader>
        <section ref="demosSection" v-if="showBtn">
          <!-- Remove the <video> element -->
          <p ref="onTheScreen" style="height: 250px;"></p>
          <audio ref="audio">
            <source :src="alarm123" type="audio/mp3">
            Your browser does not support the audio element.
          </audio>
        </section>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { defineComponent } from 'vue';
import { VBtn, VContainer, VRow, VCol, VProgressCircular, VSkeletonLoader } from 'vuetify/components';
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import alarm from './assets/alarm.mp3';
import VideoStream from './components/VideoStream.vue';

defineComponent({
  components: {
    VBtn,
    VContainer,
    VRow,
    VCol,
    VProgressCircular
  },
});

const video = ref(null);
const liveView = ref(null);
const demosSection = ref(null);
const onTheScreen = ref(null);
const audio = ref(null);
const showBtn = ref(false);
const camStarted = ref(false);

let model = undefined;

// loading the model
cocoSsd.load().then(function (loadedModel) {
  model = loadedModel;
  showBtn.value = true;
});

async function enableCam(event) {
  if (!model) {
    return;
  }
  const constraints = {
    video: true
  };

  // Activate the webcam stream.
  await navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
    try {
      video.value.srcObject = stream;
    } catch (error) {
      console.log('catch', error);
    }

    video.value.addEventListener('loadeddata', predictWebcam);
  });

  // Toggle camStarted
  camStarted.value = true;
}

function toggleCam() {
  if (!model) {
    // Model is not loaded, do nothing
    return;
  }

  if (camStarted.value) {
    // Stop the video stream
    const stream = video.value.srcObject;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
    }
  } else {
    // Start the video stream
    enableCam();
  }

  // Toggle camStarted
  camStarted.value = !camStarted.value;

  // Show/hide loader based on camStarted state
  showBtn.value = camStarted.value ? true : false;
}




const children2 = ref([]);
function predictWebcam() {

  //classifying a frame in the stream.
  model.detect(video.value).then(function (predictions) {

    for (let i = 0; i < children2.value.length; i++) {
      onTheScreen.value.removeChild(children2.value[i]);
    }

    children2.value.splice(0);

    // loop through predictions
    for (let n = 0; n < predictions.length; n++) {

      if (predictions[n].score > 0.66) {
        const div = document.createElement('div');
        div.innerHTML = predictions[n].class
        //check if prediction class is person to play alarm
        if (predictions[n].class == "person") {
          audio.value.play()
        }
        onTheScreen.value.appendChild(div);
        children2.value.push(div);
      }
    }

    // Call this function again to keep predicting when the browser is ready.
    window.requestAnimationFrame(predictWebcam);
  });
}
</script>

<style scoped>
.camView {
  position: relative;
  width: 100%;
  margin-top: 1rem;
}

video {
  display: block;
  width: 100%;
}

p {
  margin-top: 1rem;
}
</style>
